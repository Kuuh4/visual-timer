import { useEffect, useState } from 'react';

export type ViewportMetrics = {
    width: number;
    height: number;
    aspectRatio: number;
    /** Shorter side of the viewport — what limits a square dial. */
    minSide: number;
};

const readViewportMetrics = (): ViewportMetrics => {
    const width = window.visualViewport ? window.visualViewport.width : window.innerWidth;
    const height = window.visualViewport ? window.visualViewport.height : window.innerHeight;

    return { width, height, aspectRatio: width / height, minSide: Math.min(width, height) };
};

export function useViewportMetrics(): ViewportMetrics {
    const [metrics, setMetrics] = useState<ViewportMetrics>(readViewportMetrics);

    useEffect(() => {
        const handleViewportChange = () => {
            requestAnimationFrame(() => {
                setMetrics(readViewportMetrics());
            });
        };

        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', handleViewportChange);
        } else {
            window.addEventListener('resize', handleViewportChange);
        }

        return () => {
            if (window.visualViewport) {
                window.visualViewport.removeEventListener('resize', handleViewportChange);
            } else {
                window.removeEventListener('resize', handleViewportChange);
            }
        };
    }, []);

    return metrics;
}
