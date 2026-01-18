import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingDisplayProps {
    rating: number;
    maxRating?: number;
    size?: 'sm' | 'md' | 'lg';
    showNumber?: boolean;
    className?: string;
}

export default function RatingDisplay({ 
    rating, 
    maxRating = 5, 
    size = 'md',
    showNumber = true,
    className 
}: RatingDisplayProps) {
    const sizeClasses = {
        sm: 'w-3 h-3',
        md: 'w-4 h-4',
        lg: 'w-5 h-5',
    };

    const starSize = sizeClasses[size];

    return (
        <div className={cn('flex items-center gap-1', className)}>
            <div className="flex items-center gap-0.5">
                {[...Array(maxRating)].map((_, i) => (
                    <Star
                        key={i}
                        className={cn(
                            starSize,
                            'transition-colors',
                            i < Math.floor(rating)
                                ? 'fill-yellow-400 text-yellow-400'
                                : i < rating
                                ? 'fill-yellow-200 text-yellow-200'
                                : 'text-gray-300'
                        )}
                    />
                ))}
            </div>
            {showNumber && (
                <span className={cn(
                    'font-semibold text-gray-700 dark:text-gray-300',
                    size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'
                )}>
                    {rating.toFixed(1)}
                </span>
            )}
        </div>
    );
}
