// components/TriGoLogo.tsx
import { SVGAttributes, useId } from 'react';

interface TriGoLogoProps extends SVGAttributes<SVGElement> {
    showText?: boolean;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function TriGoLogo({ showText = true, size = 'md', className = '', ...props }: TriGoLogoProps) {
    // Generate unique IDs for each logo instance to prevent gradient conflicts
    const uniqueId = useId();
    const pinGradientId = `pinGradient-${uniqueId}`;
    const signalGradientId = `signalGradient-${uniqueId}`;
    const textGradientId = `textGradient-${uniqueId}`;

    const sizes = {
        sm: 'w-16',
        md: 'w-24',
        lg: 'w-32',
        xl: 'w-40'
    };

    return (
        <div className={`flex flex-col items-center ${sizes[size]} ${className}`} {...props}>
            {/* Map Pin Icon with Tricycle */}
            <svg 
                viewBox="0 0 120 140" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-auto"
            >
                {/* Gradients - Must be defined before use */}
                <defs>
                    {/* Emerald Green Pin Gradient */}
                    <linearGradient id={pinGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#a7f3d0" />
                        <stop offset="40%" stopColor="#6ee7b7" />
                        <stop offset="70%" stopColor="#34d399" />
                        <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                    {/* Emerald Green Signal Gradient */}
                    <linearGradient id={signalGradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#a7f3d0" />
                        <stop offset="50%" stopColor="#6ee7b7" />
                        <stop offset="100%" stopColor="#34d399" />
                    </linearGradient>
                    {/* Emerald Green Text Gradient */}
                    <linearGradient id={textGradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#6ee7b7" />
                        <stop offset="50%" stopColor="#34d399" />
                        <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                </defs>

                {/* Emerald Green Signal Waves */}
                <g opacity="1">
                    {/* Inner wave */}
                    <path 
                        d="M 70 22 Q 78 18, 86 22" 
                        stroke="#34d399"
                        strokeWidth="3.5" 
                        fill="none" 
                        strokeLinecap="round"
                    />
                    {/* Middle wave */}
                    <path 
                        d="M 66 16 Q 78 10, 90 16" 
                        stroke="#6ee7b7"
                        strokeWidth="3.5" 
                        fill="none" 
                        strokeLinecap="round"
                        opacity="0.9"
                    />
                    {/* Outer wave */}
                    <path 
                        d="M 62 10 Q 78 2, 94 10" 
                        stroke="#a7f3d0"
                        strokeWidth="3" 
                        fill="none" 
                        strokeLinecap="round"
                        opacity="0.8"
                    />
                </g>

                {/* Shadow */}
                <ellipse 
                    cx="60" 
                    cy="125" 
                    rx="18" 
                    ry="6" 
                    fill="#10b981" 
                    opacity="0.15"
                    filter="blur(3px)"
                />

                {/* Emerald Green Map Pin Shape */}
                <path 
                    d="M 60 10 C 40 10, 25 25, 25 45 C 25 65, 60 100, 60 100 C 60 100, 95 65, 95 45 C 95 25, 80 10, 60 10 Z" 
                    fill={`url(#${pinGradientId})`}
                    stroke="#10b981"
                    strokeWidth="1.5"
                    opacity="0.98"
                />

                {/* Inner Circle (White) */}
                <circle 
                    cx="60" 
                    cy="42" 
                    r="22" 
                    fill="white"
                />

                {/* Tricycle - 3 Wheels (1 Front, 2 Rear) */}
                <g transform="translate(60, 42)">
                    {/* Motorcycle Front Section (Emerald Green) */}
                    <ellipse 
                        cx="-8" 
                        cy="0" 
                        rx="3" 
                        ry="4" 
                        fill="#10b981" 
                    />
                    
                    {/* Headlight */}
                    <circle 
                        cx="-10" 
                        cy="0" 
                        r="1.2" 
                        fill="#6ee7b7" 
                    />
                    
                    {/* Handlebars */}
                    <line 
                        x1="-10" 
                        y1="-5" 
                        x2="-6" 
                        y2="-5" 
                        stroke="#10b981" 
                        strokeWidth="1.5" 
                        strokeLinecap="round"
                    />
                    
                    {/* Handlebar post */}
                    <line 
                        x1="-8" 
                        y1="-5" 
                        x2="-8" 
                        y2="-2" 
                        stroke="#10b981" 
                        strokeWidth="1.5"
                    />
                    
                    {/* Front Fork */}
                    <line 
                        x1="-8" 
                        y1="2" 
                        x2="-8" 
                        y2="5" 
                        stroke="#10b981" 
                        strokeWidth="1.5"
                    />
                    
                    {/* Passenger Cabin - Lower Part (Emerald Green Tint) */}
                    <rect 
                        x="0" 
                        y="-1" 
                        width="11" 
                        height="6" 
                        fill="#d1fae5" 
                        stroke="#34d399"
                        strokeWidth="0.8"
                        rx="1"
                    />
                    
                    {/* Passenger Cabin - Upper Window (White) */}
                    <rect 
                        x="1" 
                        y="-5" 
                        width="9" 
                        height="4" 
                        fill="white" 
                        stroke="#6ee7b7"
                        strokeWidth="0.8"
                        rx="0.5"
                    />
                    
                    {/* Roof/Canopy (Emerald Green) */}
                    <path 
                        d="M 0 -5 L 10 -5 L 12 -7 L 13 -6 L 13 -5 L 11 -5 L 10 -5" 
                        fill="#10b981" 
                        stroke="#059669"
                        strokeWidth="0.5"
                    />
                    <rect 
                        x="0" 
                        y="-7" 
                        width="13" 
                        height="2" 
                        fill="#10b981" 
                        rx="0.5"
                    />
                    
                    {/* Seat behind handlebars */}
                    <rect 
                        x="-5" 
                        y="-1" 
                        width="3" 
                        height="2" 
                        fill="#10b981" 
                        rx="0.5"
                    />
                    
                    {/* Connecting chassis */}
                    <rect 
                        x="-4" 
                        y="3" 
                        width="8" 
                        height="1.5" 
                        fill="#059669" 
                        rx="0.5"
                    />
                    
                    {/* FRONT WHEEL (Motorcycle) - 1 wheel */}
                    <circle cx="-8" cy="7" r="4" fill="none" stroke="#059669" strokeWidth="2.2" />
                    <circle cx="-8" cy="7" r="2" fill="#10b981" />
                    <circle cx="-8" cy="7" r="0.8" fill="#6ee7b7" />
                    
                    {/* REAR LEFT WHEEL (Sidecar) - wheel 2 of 3 */}
                    <circle cx="3" cy="7" r="4" fill="none" stroke="#34d399" strokeWidth="2.2" />
                    <circle cx="3" cy="7" r="2" fill="#34d399" />
                    <circle cx="3" cy="7" r="0.8" fill="#6ee7b7" />
                    
                    {/* REAR RIGHT WHEEL (Sidecar) - wheel 3 of 3 */}
                    <circle cx="9" cy="7" r="4" fill="none" stroke="#34d399" strokeWidth="2.2" />
                    <circle cx="9" cy="7" r="2" fill="#34d399" />
                    <circle cx="9" cy="7" r="0.8" fill="#6ee7b7" />
                </g>
            </svg>

            {/* TriGo Text - Emerald Green Theme */}
            {showText && (
                <div className="mt-2 flex items-center justify-center">
                    <span className="font-bold text-2xl bg-linear-to-r from-emerald-300 via-emerald-400 to-emerald-500 bg-clip-text text-transparent dark:from-emerald-200 dark:via-emerald-300 dark:to-emerald-400">
                        TriGo
                    </span>
                </div>
            )}
        </div>
    );
}
