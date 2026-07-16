import React, { useState, useEffect, useCallback } from 'react';
import { Download, RefreshCw, X, Wifi, WifiOff } from 'lucide-react';

/**
 * PWAManager handles:
 * 1. "Update available" banner when a new SW version is ready
 * 2. "Install app" prompt for the beforeinstallprompt event
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

    // ── Listen for SW update events ──
    useEffect(() => {
        // vite-plugin-pwa auto-registers the SW. We listen for the
        // "controlling" change which indicates a new version activated.
        let registration = null;

        const checkForUpdates = async () => {
            if ('serviceWorker' in navigator) {
                try {
                    registration = await navigator.serviceWorker.getRegistration();
                    if (registration) {
                        registration.addEventListener('updatefound', () => {
                            const newWorker = registration.installing;
                            if (newWorker) {
                                newWorker.addEventListener('statechange', () => {
                                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                        // New content available — show update banner
                                        setUpdateAvailable(true);
                                    }
                                });
                            }
                        });
                        // Also check immediately
                        registration.update().catch(() => {});
                    }
                } catch (e) {
                    console.warn('SW registration check failed:', e);
                }
            }
        };

        checkForUpdates();

        // Listen for controller change (after skipWaiting)
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                // New SW has taken control — reload to get fresh content
                window.location.reload();
            });
        }
    }, []);

    // ── Listen for Install Prompt ──
    useEffect(() => {
        const handler = (e) => {
            e.preventDefault();
            setInstallPrompt(e);
            // Don't show immediately if already dismissed
            const dismissed = localStorage.getItem('spyMals_install_dismissed');
            if (!dismissed) {
                setShowInstallBanner(true);
            }
        };

        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

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
                // Trigger update check
                if ('serviceWorker' in navigator) {
                    navigator.serviceWorker.getRegistration().then((reg) => {
                        if (reg) reg.update();
                    });
                }
                // Also force a page reload after a short delay if no update found
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
        if (!installPrompt) return;
        installPrompt.prompt();
        const { outcome } = await installPrompt.userChoice;
        if (outcome === 'accepted') {
            setShowInstallBanner(false);
        }
        setInstallPrompt(null);
    };

    const dismissInstall = () => {
        setShowInstallBanner(false);
        localStorage.setItem('spyMals_install_dismissed', 'true');
    };

    return (
        <>
            {/* Pull-to-refresh indicator */}
            {isPulling && (
                <div
                    className="fixed top-0 left-0 right-0 z-[200] flex justify-center pt-2 pointer-events-none transition-transform"
                    style={{ transform: `translateY(${pullProgress * 40}px)`, opacity: pullProgress }}
                >
                    <div className="bg-spy-lime text-spy-blue rounded-full p-2 shadow-[2px_2px_0_#000] border-2 border-black">
                        <RefreshCw className={`w-5 h-5 ${pullProgress >= 1 ? 'animate-spin' : ''}`} />
                    </div>
                </div>
            )}

            {/* Offline indicator */}
            {isOffline && (
                <div className="fixed top-2 left-1/2 -translate-x-1/2 z-[200] bg-rose-600 text-white text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-full border-2 border-black shadow-[2px_2px_0_#000] flex items-center gap-1.5 animate-pop-in">
                    <WifiOff className="w-3.5 h-3.5" />
                    Hors ligne
                </div>
            )}

            {/* Update available banner */}
            {updateAvailable && (
                <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[200] bg-spy-lime text-spy-blue text-xs font-black uppercase tracking-wider px-5 py-3 rounded-2xl border-3 border-black shadow-[4px_4px_0_#000] flex items-center gap-3 animate-pop-in max-w-[90vw]">
                    <RefreshCw className="w-4 h-4 flex-shrink-0" />
                    <span>Nouvelle version disponible</span>
                    <button
                        onClick={handleUpdate}
                        className="bg-spy-blue text-spy-lime px-3 py-1.5 rounded-xl border-2 border-black text-[10px] font-black uppercase tracking-wider hover:bg-spy-blue/80 active:scale-95 transition-all cursor-pointer"
                    >
                        Mettre à jour
                    </button>
                </div>
            )}

            {/* Install app banner */}
            {showInstallBanner && (
                <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[200] bg-black/80 backdrop-blur-xl text-white text-xs font-bold px-5 py-4 rounded-2xl border-2 border-spy-lime/30 shadow-2xl flex items-center gap-3 animate-pop-in max-w-[90vw]">
                    <Download className="w-5 h-5 text-spy-lime flex-shrink-0" />
                    <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-black uppercase tracking-wider">Installer SpyMals</span>
                        <span className="text-[9px] text-white/50 font-bold">Joue hors ligne, comme une vraie app</span>
                    </div>
                    <button
                        onClick={handleInstall}
                        className="bg-spy-lime text-spy-blue px-3 py-2 rounded-xl border-2 border-black text-[10px] font-black uppercase tracking-wider hover:bg-spy-lime/90 active:scale-95 transition-all cursor-pointer flex-shrink-0"
                    >
                        Installer
                    </button>
                    <button
                        onClick={dismissInstall}
                        className="text-white/30 hover:text-white/60 transition-colors cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}
        </>
    );
};

export default PWAManager;
