import React, { createContext, useState, useEffect, useRef, useContext } from 'react';

const AudioContext = createContext(null);

export const useAudio = () => {
    const context = useContext(AudioContext);
    if (!context) {
        throw new Error('useAudio must be used within an AudioProvider');
    }
    return context;
};

export const AudioProvider = ({ children }) => {
    // State for volumes
    const [musicVolume, setMusicVolume] = useState(() => {
        const saved = localStorage.getItem('musicVolume');
        return saved !== null ? parseFloat(saved) : 0.2;
    });

    const [sfxVolume, setSfxVolume] = useState(() => {
        const saved = localStorage.getItem('sfxVolume');
        return saved !== null ? parseFloat(saved) : 0.5;
    });

    const [isDucked, setIsDucked] = useState(false);
    const musicRef = useRef(null);

    // Initialize music
    useEffect(() => {
        if (!musicRef.current) {
            musicRef.current = new Audio('/sons/music.mp3');
            musicRef.current.loop = true;
        }

        const playMusic = async () => {
            try {
                if (musicRef.current.paused) {
                    await musicRef.current.play();
                }
            } catch (err) {
                console.log("Audio autoplay blocked, waiting for interaction");
            }
        };

        playMusic();

        return () => {
            if (musicRef.current) {
                musicRef.current.pause();
                musicRef.current = null;
            }
        };
    }, []);

    // Switch background music track
    const switchMusic = async (trackName) => {
        if (!musicRef.current) return;

        if (musicRef.current.src.endsWith(trackName)) return;

        try {
            musicRef.current.pause();
            musicRef.current.src = `/sons/${trackName}`;
            musicRef.current.load();

            const playPromise = musicRef.current.play();
            if (playPromise !== undefined) {
                await playPromise;
            }
        } catch (error) {
            console.warn("Could not switch music:", error);
        }
    };

    // Update music volume when state or ducking changes
    useEffect(() => {
        if (musicRef.current) {
            const effectiveVolume = isDucked ? musicVolume * 0.35 : musicVolume;
            musicRef.current.volume = effectiveVolume;
        }
        localStorage.setItem('musicVolume', musicVolume);
    }, [musicVolume, isDucked]);

    // Save SFX volume preference
    useEffect(() => {
        localStorage.setItem('sfxVolume', sfxVolume);
    }, [sfxVolume]);

    // Auto-pause music when tab switches, app minimizes or user leaves to mobile home screen
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!musicRef.current) return;
            if (document.hidden || document.visibilityState === 'hidden') {
                musicRef.current.pause();
            } else {
                if (musicVolume > 0) {
                    musicRef.current.play().catch(e => console.log("Audio resume blocked until interaction", e));
                }
            }
        };

        const handleBlur = () => {
            if (musicRef.current) {
                musicRef.current.pause();
            }
        };

        const handleFocus = () => {
            if (musicRef.current && !document.hidden && musicVolume > 0) {
                musicRef.current.play().catch(e => console.log("Audio resume blocked", e));
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('pagehide', handleBlur);
        window.addEventListener('blur', handleBlur);
        window.addEventListener('focus', handleFocus);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('pagehide', handleBlur);
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('focus', handleFocus);
        };
    }, [musicVolume]);

    // Global click listener to unlock audio
    useEffect(() => {
        const unlockAudio = () => {
            if (musicRef.current && musicRef.current.paused && !document.hidden) {
                musicRef.current.play().catch(e => console.log("Still blocked", e));
            }
        };
        window.addEventListener('click', unlockAudio, { once: true });
        return () => window.removeEventListener('click', unlockAudio);
    }, []);

    const playSfx = (soundPath = '/sons/button.mp3', options = {}) => {
        try {
            const { pitch = 1.0, volumeMultiplier = 1.0 } = options;

            const sound = new Audio(soundPath);
            sound.volume = Math.max(0, Math.min(1, sfxVolume * volumeMultiplier));
            sound.playbackRate = pitch;

            sound.play().catch(e => console.warn("SFX play failed", e));
        } catch (e) {
            console.warn("Error playing SFX", e);
        }
    };

    const setDucking = (duck) => {
        setIsDucked(duck);
    };

    const value = {
        musicVolume,
        setMusicVolume,
        sfxVolume,
        setSfxVolume,
        playSfx,
        switchMusic,
        setDucking
    };

    return (
        <AudioContext.Provider value={value}>
            {children}
        </AudioContext.Provider>
    );
};
