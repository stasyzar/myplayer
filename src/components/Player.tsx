import { useCallback, useRef, useState } from "react";
import SoundDriver from "./SoundDriver";

export default function Player() {
    const soundController = useRef<undefined | SoundDriver>(undefined);
    const [loading, setLoading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const animationRef = useRef<number | null>(null);

    const [volume, setVolume] = useState(1);
    const [prevVolume, setPrevVolume] = useState(1);
    const [showVolume, setShowVolume] = useState(false);

    const processFile = useCallback(async (audioFile: File) => {

        if (!audioFile || !audioFile.type.includes('audio')) {
            throw new Error('Wrong audio file');
        }
        setLoading(true);

        const soundInstance = new SoundDriver(audioFile);
        try {
            await soundInstance.init(document.getElementById('waveContainer'));
            soundController.current = soundInstance;
            soundInstance.drawChart();
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    }, []);

    const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
    };

    const onDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(true);
    };
    const onDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(false);
    };
    const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(false);
        const files = event.dataTransfer.files;
        if (files && files.length > 0) {
            processFile(files[0]);
        }
    };

    const uploadAudio = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { files } = event.target;
        if (files && files.length > 0) {
            processFile(files[0]);
        }
    };

    const startAnimation = () => {
        stopAnimation();
        const update = () => {
            if (soundController.current) {
                const currentTime = soundController.current.getCurrentTime();
                soundController.current.moveCursor(currentTime);
                animationRef.current = requestAnimationFrame(update);
            }
        };
        animationRef.current = requestAnimationFrame(update);
    }

    const stopAnimation = () => {
        if (animationRef.current !== null) {
            cancelAnimationFrame(animationRef.current);
            animationRef.current = null;
        }
    }

    const togglePlayer = useCallback((type: string) => () => {
        if (type === 'play') {
            soundController.current?.play();
            startAnimation();
        } else if (type === 'stop') {
            soundController.current?.pause(true);
            stopAnimation();
            soundController.current?.moveCursor(0);
        } else {
            soundController.current?.pause();
            stopAnimation();
        }
    }, []);


    const onVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newVol = Number(event.target.value);
        setVolume(newVol);
        soundController.current?.changeVolume(newVol);
    };

    const toggleMute = () => {
        if (volume > 0) {
            setPrevVolume(volume);
            setVolume(0);
            soundController.current?.changeVolume(0);
        } else {
            const restored = prevVolume > 0 ? prevVolume : 0.5;
            setVolume(restored);
            soundController.current?.changeVolume(restored);
        }
    };

    return (
        <div onDragOver={onDragOver}
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            style={{ width: '100%' }}>
            {!soundController.current && (
                <div
                    style={{
                        maxWidth: '500px',
                        margin: '60px auto',
                        padding: '50px 20px',
                        textAlign: 'center',
                        borderRadius: '16px',
                        border: isDragging ? '2px dashed #03A300' : '2px dashed #444',
                        backgroundColor: isDragging ? 'rgba(3, 163, 0, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                        transition: 'all 0.2s ease',
                        color: '#eee'
                    }}>
                    <h3 style={{ margin: '0 0 10px 0' }}>
                        {isDragging ? 'Відпустіть файл тут!' : 'Перетягніть аудіофайл сюди'}
                    </h3>
                    <input type="file" name="sound" onChange={uploadAudio} accept="audio/*" />
                </div>
            )}
            {loading && 'Loading...'}

            <div style={{ width: '100%', height: '392px' }} id="waveContainer" />

            {!loading && soundController.current && (
                <div id="soundEditor">
                    <div id="controllPanel" style={{ display: 'flex', justifyContent: 'center', marginTop: '30px', gap: '16px', }}>
                        <div onMouseEnter={() => setShowVolume(true)}
                            onMouseLeave={() => setShowVolume(false)} style={{
                                display: 'flex',
                                alignItems: 'center',
                                background: 'rgba(255, 255, 255, 0.08)',
                                padding: '8px 12px',
                                borderRadius: '30px',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                backdropFilter: 'blur(8px)',
                                transition: 'all 0.3s ease',
                            }}>
                            <button
                                type="button"
                                onClick={toggleMute}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '18px',
                                    padding: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                }}
                            >
                                {volume === 0 ? '🔇' : '🔊'}
                            </button>
                            <div style={{
                                width: showVolume ? '100px' : '0px',

                                marginLeft: showVolume ? '8px' : '0px',
                                overflow: 'hidden',
                                transition: 'all 0.25s ease',
                                display: 'flex',
                                alignItems: 'center',
                            }}>
                                <input
                                    type="range"
                                    min={0}
                                    max={1}
                                    step={0.01}
                                    value={volume}
                                    onChange={onVolumeChange}
                                    style={{
                                        cursor: 'pointer',
                                        accentColor: '#7B2CBF',
                                        width: '85px',
                                    }}
                                />
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', }}>
                            <button type="button" onClick={togglePlayer('play')} style={{
                                background: '#7B2CBF',
                                color: '#fff',
                                fontSize: '22px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                paddingLeft: '3px',
                            }}>
                                Play ▶
                            </button>

                            <button type="button" onClick={togglePlayer('pause')} style={{
                                background: '#c31b8e',
                                color: '#fff',
                                fontSize: '22px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                paddingLeft: '3px',
                            }}>
                                Pause ⏸
                            </button>

                            <button type="button" onClick={togglePlayer('stop')} style={{
                                background: '#001df5',
                                color: '#fff',
                                fontSize: '22px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                paddingLeft: '3px',
                            }}>
                                Stop ⏹
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    )
}