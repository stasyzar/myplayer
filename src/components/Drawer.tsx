import type { IOptions } from "./interface";
import * as d3 from "d3";

export default class Drawer {
    private buffer: AudioBuffer;

    private parent: HTMLElement;

    private cursor?: any;

    private timeScale?: any;

    public onSeekCallback?: (seconds: number) => void;

    private isDraggingCursor = false;

    constructor(buffer: AudioBuffer, parent: HTMLElement) {
        this.buffer = buffer;
        this.parent = parent;
    }

    private getTimeDomain() {
        const step = 30;
        const steps = Math.ceil(this.buffer.duration / step);

        return [...new Array(steps)].map(((_, index) => {
            const date = new Date(1970, 0, 1, 0, 0, 0, 0);
            date.setSeconds(index * step);

            let minutes = date.getMinutes().toString();
            if (minutes.length === 1) {
                minutes = `0${minutes}`;
            }

            let seconds = date.getSeconds().toString();
            if (seconds.length === 1) {
                seconds = `0${seconds}`;
            }
            return `${minutes}:${seconds}`;
        }))
    }

    private generateWaveform(audioData: number[], options: IOptions) {
        const {
            margin = { top: 0, bottom: 0, left: 0, right: 0 },
            height = this.parent.clientHeight,
            width = this.parent.clientWidth,
            padding = 0.8
        } = options;

        const domain = d3.extent(audioData);
        const xScale = d3.scaleLinear().domain([0, audioData.length - 1]).range([margin.left, width - margin.right]);
        const yScale = d3.scaleLinear().domain(domain.map(i => Number(i))).range([margin.top, height - margin.bottom]);

        const svg = d3.create('svg');

        svg
            .style('width', this.parent.clientWidth)
            .style('height', this.parent.clientHeight)
            .style('display', 'block');

        svg
            .append('g')
            .attr('stroke-width', 0.5)
            .attr('stroke', '#d7d6e5')
            .call(g =>
                g
                    .append('g')
                    .selectAll('line')
                    .data(xScale.ticks())
                    .join('line')
                    .attr('x1', (d: d3.NumberValue) => 0.5 + xScale(d))
                    .attr('x2', (d: d3.NumberValue) => 0.5 + xScale(d))
                    .attr('y1', 0)
                    .attr('y2', this.parent.clientHeight)
            )
            .call(g =>
                g
                    .append('g')
                    .selectAll('line')
                    .data(yScale.ticks())
                    .join('line')
                    .attr('y1', (d: d3.NumberValue) => yScale(d))
                    .attr('y2', (d: d3.NumberValue) => yScale(d))
                    .attr('x1', 0)
                    .attr('x2', this.parent.clientWidth)
            );

        svg
            .append('rect')
            .attr('width', width)
            .attr('height', height)
            .attr('fill', 'rgba(255, 255, 255, 0)');

        const defs = svg.append('defs');
        const gradient = defs
            .append('linearGradient')
            .attr('id', 'waveGradient')
            .attr('gradientUnits', 'userSpaceOnUse')
            .attr('x1', '0%')
            .attr('y1', '0%')
            .attr('x2', '100%')
            .attr('y2', '0%');

        gradient
            .append('stop')
            .attr('offset', '0%')
            .attr('stop-color', '#001df5');

        gradient
            .append('stop')
            .attr('offset', '100%')
            .attr('stop-color', '#7B2CBF');

        const g = svg
            .append('g')
            .attr('transform', `translate(0, ${height / 2})`)

        const band = (width - margin.left - margin.right) / audioData.length;

        g.selectAll('rect')
            .data(audioData)
            .join('rect')
            .attr('fill', 'url(#waveGradient)')
            .attr('height', d => yScale(d))
            .attr('width', () => band * padding)
            .attr('x', (_, i) => xScale(i))
            .attr('y', d => -yScale(d) / 2)
            .attr('rx', band / 2)
            .attr('ry', band / 2);

        const bands = this.getTimeDomain();

        const bandScale = d3
            .scaleBand()
            .domain(bands)
            .range([margin.left, this.parent.clientWidth]);

        svg
            .append('g')
            .call(g => g.select('.domain').remove())
            .attr('stroke-width', 0)
            .style('color', '#eaeee4')
            .style('font-size', 11)
            .style('font-weight', 400)
            .call(d3.axisBottom(bandScale.copy()));


        this.timeScale = d3
            .scaleLinear()
            .domain([0, this.buffer.duration])
            .range([margin.left, width - margin.right]);

        const coursorGroup = svg
            .append('g')
            .attr('id', 'playhead-cursor')
            .attr('transform', `translate(${margin.left}, 0)`);

        coursorGroup.style('cursor', 'ew-resize');

        coursorGroup
            .append('line')
            .attr('x1', 0)
            .attr('x2', 0)
            .attr('y1', 0)
            .attr('y2', height)
            .attr('stroke', '#ffffff')
            .attr('stroke-width', 2);

        coursorGroup
            .append('polygon')
            .attr('points', '-7,0 7,0 0,12')
            .attr('fill', '#ffffff')

        coursorGroup.call(
            d3.drag<SVGGElement, undefined>()
            .on('start', () => {
            this.isDraggingCursor = true;
        })
                .on('drag', event => {
                    const minX = margin.left;
                    const maxX = width - margin.right;

                    const clampedX = Math.max(minX, Math.min(event.x, maxX));

                    coursorGroup.attr('transform', `translate(${clampedX}, 0)`);
                })
                .on('end', event => {
                    this.isDraggingCursor = false;
                    const minX = margin.left;
                    const maxX = width - margin.right;
                    const clampedX = Math.max(minX, Math.min(event.x, maxX));
                    const newSeconds = this.timeScale.invert(clampedX);
                    if (this.onSeekCallback) {
                        this.onSeekCallback(newSeconds);
                    }
                })
        )
        this.cursor = coursorGroup;

        return svg;
    }

    public moveCursor(seconds: number) {
        if (!this.cursor || !this.timeScale || this.isDraggingCursor) return;

        const clampedSeconds = Math.max(0, Math.min(seconds, this.buffer.duration));
        const x = this.timeScale(clampedSeconds);

        this.cursor.attr('transform', `translate(${x}, 0)`);
    }

    private clearData() {
        const rawData = this.buffer.getChannelData(0);
        const samples = 300;
        const blockSize = Math.floor(rawData.length / samples);
        const filteredData = [];
        for (let i = 0; i < samples; i++) {
            const blockStart = blockSize * i;
            let sum = 0;
            for (let j = 0; j < blockSize; j++) {
                sum += Math.abs(rawData[blockStart + j]);
            }
            filteredData.push(sum / blockSize);
        }
        const multiplier = Math.max(...filteredData) ** -1;
        return filteredData.map(n => n * multiplier);
    }

    public init() {
        const audioData = this.clearData();
        const node = this.generateWaveform(audioData, {});
        this.parent.innerHTML = '';
        this.parent.appendChild(node.node() as Element);
    }
}