import React, { useState, useEffect } from 'react';
import { Download, RefreshCw, X, WifiOff } from 'lucide-react';

/**
 * PWAManager handles:
 * 1. "Update available" banner when a new SW version is ready
 * 2. "Install app" prompt positioned safely at the TOP (no bottom nav overlap)
 * 3. Pull-to-refresh on mobile to force check for updates
 * 4. Offline indicator
 */
const PWAManager = () => {
    const [updateAvailable, setUpdateAvailable] = useState(false);
    const [installPrompt, setInstallPrompt] = useState(null);
    const [showInstallBanner, setShowInstallBanner] = useState(false);
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    const [isPulling, setIsPulling] = useState(false);
    const [pullProgress, setPullProgress] = useState(0);

    // Check if running in standalone mode (already installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

    // ── Listen for SW update events & Auto-Check every 25 seconds ──
    useEffect(() => {
        let registration = null;
        let updateInterval = null;

        const checkForUpdates = async () => {
            if ('serviceWorker' in navigator) {
                try {
                    registration = await navigator.serviceWorker.getRegistration();
                    if (registration) {
                        // Check if there's already a waiting worker
                        if (registration.waiting && navigator.serviceWorker.controller) {
                            setUpdateAvailable(true);
                        }

                        registration.addEventListener('updatefound', () => {
                            const newWorker = registration.installing;
                            if (newWorker) {
                                newWorker.addEventListener('statechange', () => {
                                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                        setUpdateAvailable(true);
                                    }
                                });
                            }
                        });
                        
                        registration.update().catch(() => {});
                    }
                } catch (e) {
                    console.warn('SW registration check failed:', e);
                }
            }
        };

        checkForUpdates();

        // Periodically check for new version every 25 seconds
        updateInterval = setInterval(() => {
            checkForUpdates();
        }, 25000);

        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                window.location.reload();
            });
        }

        return () => {
            if (updateInterval) clearInterval(updateInterval);
        };
    }, []);

    // ── Listen for Install Prompt ──
    useEffect(() => {
        if (isStandalone) return;

        const handler = (e) => {
            e.preventDefault();
            setInstallPrompt(e);
            setShowInstallBanner(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        // Show banner if not standalone and prompt exists or on initial load check
        const sessionDismissed = sessionStorage.getItem('spyMals_install_session_dismissed');
        if (!isStandalone && !sessionDismissed) {
            setShowInstallBanner(true);
        }

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, [isStandalone]);

    // ── Offline Detection ──
    useEffect(() => {
        const onOnline = () => setIsOffline(false);
        const onOffline = () => setIsOffline(true);
        window.addEventListener('online', onOnline);
        window.addEventListener('offline', onOffline);
        return () => {
            window.removeEventListener('online', onOnline);
            window.removeEventListener('offline', onOffline);
        };
    }, []);

    // ── Pull-to-Refresh ──
    useEffect(() => {
        let startY = 0;
        let pulling = false;

        const onTouchStart = (e) => {
            if (window.scrollY === 0 && e.touches.length === 1) {
                startY = e.touches[0].clientY;
                pulling = true;
            }
        };

        const onTouchMove = (e) => {
            if (!pulling) return;
            const diff = e.touches[0].clientY - startY;
            if (diff > 0 && diff < 150) {
                setIsPulling(true);
                setPullProgress(Math.min(diff / 100, 1));
            }
        };

        const onTouchEnd = () => {
            if (pullProgress >= 1) {
                if ('serviceWorker' in navigator) {
                    navigator.serviceWorker.getRegistration().then((reg) => {
                        if (reg) reg.update();
                    });
                }
                setTimeout(() => window.location.reload(), 800);
            }
            setIsPulling(false);
            setPullProgress(0);
            pulling = false;
        };

        document.addEventListener('touchstart', onTouchStart, { passive: true });
        document.addEventListener('touchmove', onTouchMove, { passive: true });
        document.addEventListener('touchend', onTouchEnd, { passive: true });

        return () => {
            document.removeEventListener('touchstart', onTouchStart);
            document.removeEventListener('touchmove', onTouchMove);
            document.removeEventListener('touchend', onTouchEnd);
        };
    }, [pullProgress]);

    // ── Handlers ──
    const handleUpdate = () => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistration().then((reg) => {
                if (reg && reg.waiting) {
                    reg.waiting.postMessage({ type: 'SKIP_WAITING' });
                }
            });
        }
        setUpdateAvailable(false);
    };

    const handleInstall = async () => {
        if (!installPrompt) {
            alert("Pour installer l'app SpyMals :\n- Sur Chrome/Android: Appuyez sur ⋮ puis 'Ajouter à l'écran d'accueil'\n- Sur Safari/iOS: Appuyez sur Partager ⎋ puis 'Sur l'écran d'accueil'");
            return;
        }
        installPrompt.prompt();
        const { outcome } = await installPrompt.userChoice;
        if (outcome === 'accepted') {
            setShowInstallBanner(false);
        }
        setInstallPrompt(null);
    };

    const dismissInstall = () => {
        setShowInstallBanner(false);
        sessionStorage.setItem('spyMals_install_session_dismissed', 'true');
    };

    if (isStandalone) return null;

    return (
        <>
            {/* Pull-to-refresh indicator */}
            {isPulling && (
                <div
                    className="fixed top-0 left-0 right-0 z-[300] flex justify-center pt-2 pointer-events-none transition-transform"
                    style={{ transform: `translateY(${pullProgress * 40}px)`, opacity: pullProgress }}
                >
                    <div className="bg-spy-lime text-spy-blue rounded-full p-2 shadow-[2px_2px_0_#000] border-2 border-black">
                        <RefreshCw className={`w-5 h-5 ${pullProgress >= 1 ? 'animate-spin' : ''}`} />
                    </div>
                </div>
            )}

            {/* Offline indicator */}
            {isOffline && (
                <div className="fixed top-2 left-1/2 -translate-x-1/2 z-[300] bg-rose-600 text-white text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-full border-2 border-black shadow-lg flex items-center gap-1.5 animate-pop-in">
                    <WifiOff className="w-3.5 h-3.5" />
                    Hors ligne
                </div>
            )}

            {/* Update available banner */}
            {updateAvailable && (
                <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[300] bg-slate-950/95 backdrop-blur-2xl border-2 border-spy-lime text-white text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-full shadow-[0_12px_35px_rgba(204,255,0,0.35)] flex items-center gap-3 animate-bounce-subtle max-w-[92vw]">
                    <div className="w-7 h-7 rounded-full bg-spy-lime text-spy-blue flex items-center justify-center flex-shrink-0 animate-spin">
                        <RefreshCw className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] text-spy-lime font-black">Nouvelle mise à jour disponible !</span>
                    <button
                        onClick={handleUpdate}
                        className="bg-spy-lime text-spy-blue px-3.5 py-1.5 rounded-full border border-white text-[9px] font-black uppercase tracking-wider hover:bg-spy-lime/90 active:scale-95 transition-all cursor-pointer shadow-md flex-shrink-0"
                    >
                        Mettre à jour
                    </button>
                </div>
            )}

            {/* Install app banner (TOP position, clean floating banner) */}
            {showInstallBanner && !isOffline && !updateAvailable && (
                <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[250] bg-slate-900/95 backdrop-blur-xl text-white text-xs font-bold px-4 py-2.5 rounded-full border border-spy-lime/40 shadow-[0_8px_25px_rgba(0,0,0,0.6)] flex items-center gap-3 animate-pop-in max-w-[92vw]">
                    <div className="w-7 h-7 rounded-full bg-spy-lime/20 border border-spy-lime/40 flex items-center justify-center flex-shrink-0">
                        <Download className="w-4 h-4 text-spy-lime" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-wider text-white">Installer l'application</span>
                        <span className="text-[8px] text-spy-lime font-bold">Jouer en 1 clic sans navigateur</span>
                    </div>
                    <button
                        onClick={handleInstall}
                        className="bg-spy-lime text-spy-blue px-3 py-1.5 rounded-full border border-white/20 text-[9px] font-black uppercase tracking-wider hover:bg-spy-lime/90 active:scale-95 transition-all cursor-pointer flex-shrink-0 shadow-md"
                    >
                        Installer
                    </button>
                    <button
                        onClick={dismissInstall}
                        className="text-white/40 hover:text-white transition-colors cursor-pointer p-0.5"
                        title="Fermer"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}
        </>
    );
};

export default PWAManager;
