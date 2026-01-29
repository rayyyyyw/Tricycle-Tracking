import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingModalProps {
    bookingId: number;
    isOpen: boolean;
    onClose: () => void;
    hasReviewed?: boolean;
    driverName?: string;
}

export default function RatingModal({ bookingId, isOpen, onClose, hasReviewed, driverName = 'Driver' }: RatingModalProps) {
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        router.post(`/bookings/${bookingId}/review`, {
            rating,
            comment,
        }, {
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
        });
    };

    if (hasReviewed) {
        return null; // Don't show if already reviewed
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] p-6">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">Rate Your Ride with {driverName}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-200">How was your experience?</label>
                        <div className="flex gap-1 justify-center sm:justify-start">
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
                                            "w-8 h-8 sm:w-9 sm:h-9 transition-colors duration-200",
                                            star <= (hoveredRating || rating)
                                                ? "fill-yellow-400 text-yellow-400"
                                                : "text-gray-300"
                                        )}
                                    />
                                </button>
                            ))}
                        </div>
                        {rating === 0 && <p className="text-red-500 text-xs mt-2 text-center sm:text-left">Please select a rating.</p>}
                    </div>
                    <div>
                        <label htmlFor="comment" className="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-200">
                            Comment (optional)
                        </label>
                        <Textarea
                            id="comment"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Share your experience with the driver..."
                            rows={4}
                            maxLength={500}
                            className="min-h-[80px] text-sm bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:border-emerald-500 focus:ring-emerald-500"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
                            {comment.length}/500 characters
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 justify-end pt-2">
                        <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={rating === 0 || isSubmitting}
                            className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-50"
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Review'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
