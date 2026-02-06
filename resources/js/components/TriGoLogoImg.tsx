// Logo image using tlogo.png from public/logos
import { ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface TriGoLogoImgProps extends ImgHTMLAttributes<HTMLImageElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'w-10 h-10',
  md: 'w-12 h-12',
  lg: 'w-14 h-14',
  xl: 'w-16 h-16',
};

export default function TriGoLogoImg({ size = 'md', className, alt = 'TriGo', ...props }: TriGoLogoImgProps) {
  return (
    <img
      src="/logos/tlogo.png"
      alt={alt}
      className={cn('object-contain shrink-0', sizeClasses[size], className)}
      {...props}
    />
  );
}
