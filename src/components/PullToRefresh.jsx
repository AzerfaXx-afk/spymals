import React, { useState, useRef } from 'react';
import { RefreshCw } from 'lucide-react';

const PULL_THRESHOLD = 70;

const PullToRefresh = ({ children }) => {
    const [pullY, setPullY] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const startYRef = useRef(0);
    const isPullingRef = useRef(false);

    const handleTouchStart = (e) => {
        // Only trigger pull to refresh if scrolled to top edge
        const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
        const touchY = e.touches[0].clientY;
        if (scrollTop <= 2 && touchY < 90) {
            startYRef.current = touchY;
            isPullingRef.current = true;
        }
    };

    const handleTouchMove = (e) => {
        if (!isPullingRef.current || isRefreshing) return;
        
        const currentY = e.touches[0].clientY;
        const diff = currentY - startYRef.current;

        if (diff > 0) {
            const resistancePull = Math.min(diff * 0.4, 90);
            setPullY(resistancePull);
        }
    };

    const handleTouchEnd = () => {
        if (!isPullingRef.current) return;
        isPullingRef.current = false;

        if (pullY >= PULL_THRESHOLD && !isRefreshing) {
            setIsRefreshing(true);
            setPullY(50);

            setTimeout(() => {
                window.location.reload();
            }, 500);
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
            className="relative min-h-screen min-h-[100dvh] w-full flex flex-col"
        >
            {/* Minimal Awwwards Floating Top Refresh Indicator (App UI remains 100% fixed) */}
            {(pullY > 0 || isRefreshing) && (
                <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[100] pointer-events-none transition-all duration-150">
                    <div className="w-10 h-10 rounded-full bg-slate-950/90 border-2 border-spy-lime shadow-[0_0_20px_rgba(204,255,0,0.6)] backdrop-blur-md flex items-center justify-center">
                        <RefreshCw
                            className={`w-5 h-5 text-spy-lime stroke-[2.5] ${isRefreshing ? 'animate-spin' : ''}`}
                            style={{ transform: isRefreshing ? 'none' : `rotate(${pullProgress * 360}deg)` }}
                        />
                    </div>
                </div>
            )}

            {/* Application Main Content Container - 100% FIXED & STABLE */}
            <div className="w-full flex-1 flex flex-col min-h-screen min-h-[100dvh]">
                {children}
            </div>
        </div>
    );
};

export default PullToRefresh;
