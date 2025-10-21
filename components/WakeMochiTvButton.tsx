import React from 'react';

interface WakeMochiTvButtonProps {
    onClick: () => void;
}

export const WakeMochiTvButton: React.FC<WakeMochiTvButtonProps> = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="absolute top-4 left-4 z-50 p-2 rounded-full bg-gray-800 bg-opacity-60 text-white hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 transition-all transform hover:scale-110 animate-pulse-slow"
            aria-label="Đánh thức Mochi"
        >
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
                 {/* New Tutor Mochi SVG, sleeping */}
                <g>
                    {/* Head */}
                    <path
                    d="M 20,85 C 10,85 10,75 10,65 L 10,25 C 10,15 20,5 30,5 L 70,5 C 80,5 90,15 90,25 L 90,65 C 90,75 80,85 70,85 Z"
                    fill="white"
                    />
                    {/* Collar */}
                    <path d="M 40,83 L 35,90 L 65,90 L 60,83 Z" fill="#F3F4F6" />
                    {/* Bowtie */}
                    <path d="M 50 83 L 40 77 L 40 89 Z" fill="#3B82F6" />
                    <path d="M 50 83 L 60 77 L 60 89 Z" fill="#3B82F6" />
                    <circle cx="50" cy="83" r="3" fill="#2563EB" />

                    {/* Closed, peaceful eyes */}
                    <path d="M 30,50 Q 35,55 40,50" stroke="black" strokeWidth="4" fill="none" />
                    <path d="M 60,50 Q 65,55 70,50" stroke="black" strokeWidth="4" fill="none" />
                    
                    {/* A subtle, sleeping mouth */}
                    <path d="M 48,68 Q 50,70 52,68" stroke="black" strokeWidth="4" fill="none" />
                </g>
            </svg>
            <style>{`
                @keyframes pulse-slow {
                    0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4); }
                    50% { transform: scale(1.05); box-shadow: 0 0 0 6px rgba(255, 255, 255, 0); }
                }
                .animate-pulse-slow {
                    animation: pulse-slow 3s ease-in-out infinite;
                }
            `}</style>
        </button>
    );
};