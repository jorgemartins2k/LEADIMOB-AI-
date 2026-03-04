import React from 'react';
import { cn } from '@/lib/utils';

type LogoVariant = 'standard' | 'dark' | 'white' | 'mono' | 'outline' | 'tinted';

interface LogoProps {
    variant?: LogoVariant;
    showText?: boolean;
    className?: string;
    iconSize?: number;
    fontSize?: string;
}

export function LeadImobSymbol({
    variant = 'standard',
    size = 40,
    className = ''
}: {
    variant?: LogoVariant;
    size?: number;
    className?: string
}) {
    const colors = {
        standard: { navy: '#0E2040', blue: '#1362C6', dot: '#1875E8' },
        dark: { navy: 'rgba(255,255,255,0.9)', blue: 'rgba(255,255,255,0.55)', dot: '#fff' },
        white: { navy: '#fff', blue: 'rgba(255,255,255,0.6)', dot: '#fff' },
        mono: { navy: '#0E2040', blue: '#0E2040', dot: '#0E2040' },
        outline: { navy: '#0E2040', blue: '#1362C6', dot: '#1875E8' },
        tinted: { navy: '#0E2040', blue: '#1362C6', dot: '#1875E8' }
    };

    const c = colors[variant] || colors.standard;

    if (variant === 'outline') {
        return (
            <svg width={size} height={size} viewBox="0 0 100 102" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
                <rect x="0.6" y="28" width="19" height="57" fill="none" stroke={c.navy} strokeWidth="3" />
                <rect x="0.6" y="84" width="76" height="17" fill="none" stroke={c.navy} strokeWidth="3" />
                <path d="M 54,1 L 100,34 L 100,102 L 83,102 L 83,34 L 54,8 L 19,34 L 19,57 L 10,57 L 10,34 Z" fill="none" stroke={c.blue} strokeWidth="3" strokeLinejoin="round" />
                <circle cx="91" cy="8" r="8" fill="none" stroke={c.dot} strokeWidth="3" />
            </svg>
        );
    }

    return (
        <svg width={size} height={size} viewBox="0 0 100 102" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            <rect x="0.6" y="28" width="19" height="57" fill={c.navy} />
            <rect x="0.6" y="84" width="76" height="17" fill={c.navy} />
            <path d="M 54,1 L 100,34 L 100,102 L 83,102 L 83,34 L 54,8 L 19,34 L 19,57 L 10,57 L 10,34 Z" fill={c.blue} />
            <circle cx="91" cy="8" r="9" fill={c.dot} />
        </svg>
    );
}

export function LeadImobLogo({
    variant = 'standard',
    showText = true,
    className = '',
    iconSize = 32,
    fontSize = 'text-xl'
}: LogoProps) {
    const textColors = {
        standard: { main: 'text-[#0E2040]', ai: 'text-[#1362C6]' },
        dark: { main: 'text-white', ai: 'text-[#5BAEF0]' },
        white: { main: 'text-white', ai: 'text-white' },
        mono: { main: 'text-[#0E2040]', ai: 'text-[#0E2040]' },
        outline: { main: 'text-[#0E2040]', ai: 'text-[#1362C6]' },
        tinted: { main: 'text-[#0E2040]', ai: 'text-[#1362C6]' }
    };

    const tc = textColors[variant] || textColors.standard;

    return (
        <div className={cn("flex items-center gap-3", className)}>
            <LeadImobSymbol variant={variant === 'dark' || variant === 'white' ? variant : (variant === 'standard' || variant === 'tinted' ? 'standard' : variant)} size={iconSize} />
            {showText && (
                <div className={cn("flex items-baseline gap-1 font-sora tracking-tighter", fontSize)}>
                    <span className={cn(tc.main, "font-bold")}>LEADIMOB</span>
                    <span className={cn(tc.ai, "font-extrabold")}>Ai</span>
                </div>
            )}
        </div>
    );
}

export default LeadImobLogo;
