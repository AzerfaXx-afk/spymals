import React, { useState, useRef, useEffect } from 'react';
import { RefreshCw, ArrowDown } from 'lucide-react';

const PULL_THRESHOLD = 80;

const PullToRefresh = ({ children }) => {
    const [pullY, setPullY] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const startYRef = useRef(0);
    const isPullingRef = useRef(false);

    const handleTouchStart = (e) => {
        // Only trigger pull to refresh if scrolled to the top of the container
        const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
        if (scrollTop <= 5) {
            startYRef.current = e.touches[0].clientY;
            isPullingRef.current = true;
        }
    };

    const handleTouchMove = (e) => {
        if (!isPullingRef.current || isRefreshing) return;
        
        const currentY = e.touches[0].clientY;
        const diff = currentY - startYRef.current;

        if (diff > 0) {
            // Apply damping resistance formula
            const resistancePull = Math.min(diff * 0.45, 110);
            setPullY(resistancePull);
        }
    };

    const handleTouchEnd = () => {
        if (!isPullingRef.current) return;
        isPullingRef.current = false;

        if (pullY >= PULL_THRESHOLD && !isRefreshing) {
            setIsRefreshing(true);
            setPullY(65);

            // Trigger smooth window reload or data refresh
            setTimeout(() => {
                window.location.reload();
            }, 600);
        } else {
            setPullY(0);
        }
    };

    const pullProgress = Math.min(pullY / PULL_THRESHOLD, 1);

    return (
        <div 
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="relative min-h-screen w-full"
        >
            {/* Pull to refresh visual indicator badge */}
            {(pullY > 0 || isRefreshing) && (
                <div 
                    style={{ transform: `translateY(${pullY}px)` }}
                    className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center pointer-events-none transition-transform duration-75"
                >
                    <div className="bg-slate-900/90 border-2 border-spy-lime/60 backdrop-blur-md px-4 py-2 rounded-full shadow-[0_8px_20px_rgba(0,0,0,0.7)] flex items-center gap-2 text-white font-black text-xs uppercase tracking-wider">
                        <div 
                            style={{ transform: `rotate(${pullProgress * 360}deg)` }}
                            className="w-5 h-5 flex items-center justify-center"
                        >
                            {isRefreshing ? (
                                <RefreshCw className="w-4 h-4 text-spy-lime animate-spin stroke-[3]" />
                            ) : pullY >= PULL_THRESHOLD ? (
                                <RefreshCw className="w-4 h-4 text-spy-lime stroke-[3]" />
                            ) : (
                                <ArrowDown className="w-4 h-4 text-spy-lime stroke-[3]" />
                            )}
                        </div>
                        <span className={pullY >= PULL_THRESHOLD || isRefreshing ? 'text-spy-lime' : 'text-white/80'}>
                            {isRefreshing ? 'RAFRAÎCHISSEMENT...' : pullY >= PULL_THRESHOLD ? 'RELÂCHER POUR RAFRAÎCHIR' : 'TIRER POUR RAFRAÎCHIR'}
                        </span>
                    </div>
                </div>
            )}

            {/* Application Main Content Container */}
            <div 
                style={{ 
                    transform: pullY > 0 ? `translateY(${pullY * 0.4}px)` : 'none',
                    transition: isPullingRef.current ? 'none' : 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}
            >
                {children}
            </div>
        </div>
    );
};

export default PullToRefresh;
