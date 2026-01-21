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
                    <linearGradient id={pinGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#6ee7b7" />
                        <stop offset="50%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                    <linearGradient id={signalGradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#6ee7b7" />
                        <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                    <linearGradient id={textGradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#6ee7b7" />
                        <stop offset="50%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                </defs>

                {/* Signal Waves */}
                <g opacity="0.8">
                    <path 
                        d="M 75 18 Q 80 15, 85 18" 
                        stroke={`url(#${signalGradientId})`}
                        strokeWidth="2.5" 
                        fill="none" 
                        strokeLinecap="round"
                    />
                    <path 
                        d="M 78 12 Q 85 8, 92 12" 
                        stroke={`url(#${signalGradientId})`}
                        strokeWidth="2.5" 
                        fill="none" 
                        strokeLinecap="round"
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

                {/* Map Pin Shape */}
                <path 
                    d="M 60 10 C 40 10, 25 25, 25 45 C 25 65, 60 100, 60 100 C 60 100, 95 65, 95 45 C 95 25, 80 10, 60 10 Z" 
                    fill={`url(#${pinGradientId})`}
                    stroke="#059669"
                    strokeWidth="1"
                    opacity="0.95"
                />

                {/* Inner Circle (White) */}
                <circle 
                    cx="60" 
                    cy="42" 
                    r="22" 
                    fill="white"
                />

                {/* Simplified Tricycle - Better visibility at small sizes */}
                <g transform="translate(60, 42)">
                    {/* Canopy/Roof */}
                    <path 
                        d="M -6 -8 L 6 -8 Q 7 -7, 7 -5 L 7 2 L -6 2 Z" 
                        fill="#10b981" 
                        opacity="0.9"
                    />
                    
                    {/* Body/Passenger area */}
                    <rect 
                        x="-5" 
                        y="-2" 
                        width="10" 
                        height="6" 
                        fill="#047857" 
                        rx="1"
                    />
                    
                    {/* Front Wheel */}
                    <circle cx="-8" cy="5" r="3.5" fill="none" stroke="#047857" strokeWidth="1.5" />
                    <circle cx="-8" cy="5" r="1.5" fill="#047857" />
                    
                    {/* Back Left Wheel */}
                    <circle cx="5" cy="5" r="3.5" fill="none" stroke="#047857" strokeWidth="1.5" />
                    <circle cx="5" cy="5" r="1.5" fill="#047857" />
                    
                    {/* Back Right Wheel */}
                    <circle cx="10" cy="5" r="3.5" fill="none" stroke="#047857" strokeWidth="1.5" />
                    <circle cx="10" cy="5" r="1.5" fill="#047857" />
                    
                    {/* Handlebar */}
                    <path 
                        d="M -8 -2 L -8 5" 
                        stroke="#047857" 
                        strokeWidth="1.5" 
                        fill="none"
                        strokeLinecap="round"
                    />
                    <line 
                        x1="-9" 
                        y1="-2" 
                        x2="-7" 
                        y2="-2" 
                        stroke="#047857" 
                        strokeWidth="1.5" 
                        strokeLinecap="round"
                    />
                </g>
            </svg>

            {/* TriGo Text */}
            {showText && (
                <div className="mt-2 flex items-center justify-center">
                    <span className="font-bold text-2xl bg-linear-to-r from-emerald-400 via-green-500 to-emerald-600 bg-clip-text text-transparent dark:from-emerald-300 dark:via-green-400 dark:to-emerald-500">
                        TriGo
                    </span>
                </div>
            )}
        </div>
    );
}
