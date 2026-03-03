import React from 'react';

interface LogoProps {
    width?: number;
    height?: number;
    className?: string;
}

export function LeadImobLogo({ width = 180, height = 45, className = '' }: LogoProps) {
    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <svg width={height * 0.9} height={height * 0.9} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-sm">
                <defs>
                    <linearGradient id="hex-gradient" x1="15" y1="15" x2="45" y2="47">
                        <stop offset="0%" stopColor="#2563eb" />
                        <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                </defs>
                <path d="M30 5L52 17V43L30 55L8 43V17L30 5Z" fill="url(#hex-gradient)" />
                <path d="M30 18L42 27V42H18V27L30 18Z" fill="white" fillOpacity="0.2" />
                <path d="M30 15L45 23V39L30 47L15 39V23L30 15Z" stroke="white" strokeWidth="2" strokeOpacity="0.4" />
                <circle cx="30" cy="32" r="4" fill="white" />
            </svg>
            <span className="text-xl font-black tracking-tighter font-display text-foreground">
                LEADIMOB <span className="text-accent">AI</span>
            </span>
        </div>
    );
}

export function LeadImobSymbol({ size = 40, className = '' }: { size?: number; className?: string }) {
    return (
        <svg width={size} height={size} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            <defs>
                <linearGradient id="hex-gradient-symbol" x1="15" y1="15" x2="45" y2="47">
                    <stop offset="0%" stopColor="#2563eb" />
                    <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
            </defs>
            <path d="M30 15L45 23L45 39L30 47L15 39L15 23Z" fill="url(#hex-gradient-symbol)" stroke="#1e40af" strokeWidth="2.5" />
            <path d="M30 10L50 24L45 27L30 16L15 27L10 24Z" fill="#1e3a8a" stroke="#0f172a" strokeWidth="2" />
            <circle cx="30" cy="25" r="2.5" fill="#10b981" />
            <circle cx="25" cy="31" r="2.5" fill="#10b981" />
            <circle cx="35" cy="31" r="2.5" fill="#10b981" />
            <circle cx="30" cy="37" r="2.5" fill="#10b981" />
            <circle cx="30" cy="31" r="3.5" fill="#f59e0b" />
        </svg>
    );
}

export default LeadImobLogo;
