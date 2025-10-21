import React, { useState, useEffect } from 'react';
import { vietnameseQuotes } from '../services/quotesService';

interface ClockProps {
    variant: 'idle' | 'chat' | 'aod';
}

const Clock: React.FC<ClockProps> = ({ variant }) => {
    const [date, setDate] = useState(new Date());
    const [quoteIndex, setQuoteIndex] = useState(() => Math.floor(Math.random() * vietnameseQuotes.length));

    useEffect(() => {
        const timerId = setInterval(() => setDate(new Date()), 1000);
        let quoteRotationIntervalId: number | null = null;

        if (variant === 'idle') {
            quoteRotationIntervalId = setInterval(() => {
                setQuoteIndex(prevIndex => {
                    let nextIndex = prevIndex;
                    while (nextIndex === prevIndex) {
                        nextIndex = Math.floor(Math.random() * vietnameseQuotes.length);
                    }
                    return nextIndex;
                });
            }, 1000 * 60); // Rotate quote every minute
        }

        return () => {
            clearInterval(timerId);
            if (quoteRotationIntervalId) clearInterval(quoteRotationIntervalId);
        };
    }, [variant]);

    const timeFormatter = new Intl.DateTimeFormat('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });

    const dateFormatter = new Intl.DateTimeFormat('vi-VN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    });
    
    const shortDateFormatter = new Intl.DateTimeFormat('vi-VN', {
        weekday: 'short',
        day: 'numeric',
        month: 'numeric'
    });

    if (variant === 'chat') {
        return (
            <div className="text-left text-white">
                <h1 className="text-2xl font-semibold tracking-wide">
                    {timeFormatter.format(date)}
                </h1>
                <p className="text-xs text-gray-400 capitalize">
                    {shortDateFormatter.format(date)}
                </p>
            </div>
        );
    }

    if (variant === 'aod') {
        return (
            <div className="text-center">
                <h1 className="text-8xl md:text-9xl font-bold text-gray-800 tracking-wider">
                    {timeFormatter.format(date)}
                </h1>
                <p className="text-2xl md:text-3xl font-medium text-gray-700 capitalize tracking-wide mt-2">
                    {dateFormatter.format(date)}
                </p>
            </div>
        );
    }

    const currentQuote = vietnameseQuotes[quoteIndex];

    return (
        <div className="text-center text-white animate-fade-in-slow">
            <h1 
                className="text-8xl md:text-9xl font-bold tracking-wider"
                style={{ textShadow: '0 0 15px rgba(255, 255, 255, 0.3), 0 0 5px rgba(255, 255, 255, 0.2)' }}
            >
                {timeFormatter.format(date)}
            </h1>
            <p className="text-2xl md:text-3xl font-medium text-gray-300 capitalize tracking-wide mt-2">
                {dateFormatter.format(date)}
            </p>

            {currentQuote && (
                <div className="mt-6 text-lg md:text-xl text-gray-400 italic animate-fade-in px-4 max-w-2xl mx-auto">
                    <p>"{currentQuote}"</p>
                </div>
            )}

            <style>{`
                @keyframes fadeInSlow {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-slow {
                    animation: fadeInSlow 1.2s ease-out forwards;
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in {
                    animation: fadeIn 1s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default Clock;
