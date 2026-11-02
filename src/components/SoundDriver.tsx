import Drawer from "./Drawer";

export default class SoundDriver {
    private readonly audioFile: Blob;

    private drawer?: Drawer;

    private context: AudioContext;

    private gainNode?: GainNode = undefined;

    private audioBuffer?: AudioBuffer = undefined;

    private bufferSourse?: AudioBufferSourceNode = undefined;

    private startedAt = 0;

    private pausedAt = 0;

    private isRunning = false;

    constructor(audioFile: Blob) {
        this.audioFile = audioFile;
        this.context = new AudioContext();
    }

    static showError(error: string) {
        alert('SoundParser constructor error. Can not read audio file as ArrayBuffer');
        return error;
    }

    public init(parent: HTMLElement | null) {
        return new Promise((resolve, reject) => {
            if (!parent) {
                reject(new Error('Parent element not found'));
                return;
            }
            const reader = new FileReader();
            reader.readAsArrayBuffer(this.audioFile);
            reader.onload = (event: ProgressEvent<FileReader>) =>
                this.loadSound(event).then(buffer => {
                    this.audioBuffer = buffer;
                    this.drawer = new Drawer(buffer, parent);
                    this.drawer.onSeekCallback = (seconds: number) => {
                        this.seek(seconds);
                    };
                    resolve(undefined);
                })

            reader.onerror = reject;
        });
    }

    private loadSound(readerEvent: ProgressEvent<FileReader>) {
        if (!readerEvent?.target?.result) {
            throw new Error('Can not read file');
        }
        return this.context.decodeAudioData(readerEvent.target.result as ArrayBuffer);
    }

    public async play() {
        if (!this.audioBuffer) {
            throw new Error(
                'Play error. Audio buffer is not exists. Try to call loadSound before Play.'
            );
        }

        if (this.isRunning) {
            return;
        }

        this.gainNode = this.context.createGain();

        this.bufferSourse = this.context.createBufferSource();
        this.bufferSourse.buffer = this.audioBuffer;

        this.bufferSourse.connect(this.gainNode);
        this.gainNode.connect(this.context.destination);

        await this.context.resume();
        this.bufferSourse.start(0, this.pausedAt);

        this.startedAt = this.context.currentTime - this.pausedAt;
        this.pausedAt = 0;

        this.isRunning = true;
    }

    public async pause(reset?: boolean) {
        if (!this.bufferSourse || !this.gainNode) {
            throw new Error(
                'Pause - bufferSource is not exists. Maybe you forgot to call Play before?'
            );
        }

        await this.context.suspend();

        this.pausedAt = reset ? 0 : this.context.currentTime - this.startedAt;
        this.bufferSourse.stop(this.pausedAt);
        this.bufferSourse.disconnect();
        this.gainNode.disconnect();

        this.isRunning = false;
    }

    public changeVolume(volume: number) {
        if (!this.gainNode) {
            return;
        }

        this.gainNode.gain.value = volume;
    }

    public drawChart() {
        this.drawer?.init();
    }

    public getCurrentTime() {
        if (this.isRunning) {
            return this.context.currentTime - this.startedAt;
        }
        return this.pausedAt;
    }

    public moveCursor(seconds: number) {
        this.drawer?.moveCursor(seconds);
    }

    public seek(newTime: number) {
        if (!this.audioBuffer) return;

        if (this.isRunning) {
            if (this.bufferSourse) {
                this.bufferSourse.stop();
                this.bufferSourse.disconnect();
            }

            this.bufferSourse = this.context.createBufferSource();
            this.bufferSourse.buffer = this.audioBuffer;
            this.bufferSourse.connect(this.gainNode!);

            this.bufferSourse.start(0, newTime);

            this.startedAt = this.context.currentTime - newTime;
            this.pausedAt = 0;
        } else {
            this.pausedAt = newTime;
        }
    }
}