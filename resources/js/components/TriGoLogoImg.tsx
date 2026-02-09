// Logo image using tlogo.png from public/logos
import { cn } from '@/lib/utils';
import { ImgHTMLAttributes } from 'react';

interface TriGoLogoImgProps extends ImgHTMLAttributes<HTMLImageElement> {
    size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-14 h-14',
    xl: 'w-16 h-16',
    '2xl': 'w-24 h-24 sm:w-28 sm:h-28',
};

export default function TriGoLogoImg({
    size = 'md',
    className,
    alt = 'TriGo',
    ...props
}: TriGoLogoImgProps) {
    return (
        <img
            src="/logos/tlogo.png"
            alt={alt}
            className={cn(
                'shrink-0 object-contain',
                sizeClasses[size],
                className,
            )}
            {...props}
        />
    );
}
