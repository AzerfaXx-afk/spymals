import React from 'react';

const PullToRefresh = ({ children }) => {
    return (
        <div className="w-full min-h-[100dvh] flex flex-col overflow-x-hidden">
            {children}
        </div>
    );
};

export default PullToRefresh;
