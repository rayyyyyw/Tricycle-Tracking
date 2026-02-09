import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { router } from '@inertiajs/react';
import { Star } from 'lucide-react';
import { useState } from 'react';

interface RatingModalProps {
    bookingId: number;
    isOpen: boolean;
    onClose: () => void;
    hasReviewed?: boolean;
    driverName?: string;
}

export default function RatingModal({
    bookingId,
    isOpen,
    onClose,
    hasReviewed,
    driverName = 'Driver',
}: RatingModalProps) {
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        router.post(
            `/bookings/${bookingId}/review`,
            {
                rating,
                comment,
            },
            {
                onSuccess: () => {
                    onClose();
                    setRating(0);
                    setComment('');
                },
                onError: (errors) => {
                    console.error('Error submitting review:', errors);
                    alert('Failed to submit review. Please try again.');
                },
                onFinish: () => setIsSubmitting(false),
            },
        );
    };

    if (hasReviewed) {
        return null; // Don't show if already reviewed
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="p-6 sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
                        Rate Your Ride with {driverName}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
                            How was your experience?
                        </label>
                        <div className="flex justify-center gap-1 sm:justify-start">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoveredRating(star)}
                                    onMouseLeave={() => setHoveredRating(0)}
                                    className="focus:outline-none"
                                >
                                    <Star
                                        className={cn(
                                            'h-8 w-8 transition-colors duration-200 sm:h-9 sm:w-9',
                                            star <= (hoveredRating || rating)
                                                ? 'fill-yellow-400 text-yellow-400'
                                                : 'text-gray-300',
                                        )}
                                    />
                                </button>
                            ))}
                        </div>
                        {rating === 0 && (
                            <p className="mt-2 text-center text-xs text-red-500 sm:text-left">
                                Please select a rating.
                            </p>
                        )}
                    </div>
                    <div>
                        <label
                            htmlFor="comment"
                            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200"
                        >
                            Comment (optional)
                        </label>
                        <Textarea
                            id="comment"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Share your experience with the driver..."
                            rows={4}
                            maxLength={500}
                            className="min-h-[80px] border-gray-200 bg-gray-50 text-sm focus:border-emerald-500 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-700"
                        />
                        <p className="mt-1 text-right text-xs text-gray-500 dark:text-gray-400">
                            {comment.length}/500 characters
                        </p>
                    </div>
                    <div className="flex flex-col justify-end gap-3 pt-2 sm:flex-row">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="w-full sm:w-auto"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={rating === 0 || isSubmitting}
                            className="w-full bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50 sm:w-auto"
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Review'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
