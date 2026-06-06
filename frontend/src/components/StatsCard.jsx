import React, { useEffect, useState, useRef } from 'react';

function AnimatedCounter({ value, duration = 800 }) {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const numericValue = typeof value === 'string' ? parseInt(value) : value;

    useEffect(() => {
        if (isNaN(numericValue)) {
            setCount(value);
            return;
        }

        let start = 0;
        const end = numericValue;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(start + (end - start) * eased);
            setCount(current);

            if (progress < 1) {
                ref.current = requestAnimationFrame(animate);
            }
        };

        ref.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(ref.current);
    }, [numericValue, duration]);

    return <>{count}{typeof value === 'string' && value.includes('%') ? '%' : ''}{typeof value === 'string' && value.includes('/') ? '/' + value.split('/')[1] : ''}</>;
}

function StatsCard({ icon, value, label, color }) {
    return (
        <div className="stats-card" style={{ borderTopColor: color }}>
            <div className="stats-icon" style={{ color }}>{icon}</div>
            <div className="stats-value" style={{ color }}>
                <AnimatedCounter value={value} />
            </div>
            <div className="stats-label">{label}</div>
        </div>
    );
}

export default StatsCard;
