import { Truck } from 'lucide-react';

/**
 * Van/truck animation: runs from Point A (left) to Point B (right) and back in a loop.
 * Used on "Looking for a driver" waiting state. Slightly slower, longer route.
 */
export default function TricycleSearchingAnimation() {
    return (
        <div className="mx-auto w-full max-w-xl">
            {/* Point labels */}
            <div className="mb-1 flex justify-between px-1 text-xs font-semibold text-muted-foreground">
                <span className="rounded bg-emerald-100 px-2 py-0.5 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                    A · Pickup
                </span>
                <span className="rounded bg-blue-100 px-2 py-0.5 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                    B · Destination
                </span>
            </div>

            {/* Track + van */}
            <div className="relative h-20 px-2 sm:h-24">
                {/* Road / track — longer route */}
                <div className="absolute top-1/2 right-2 left-2 h-3 -translate-y-1/2 rounded-full bg-gray-200 sm:h-4 dark:bg-gray-700" />

                {/* Van — animates A → B → A (loop), slower + smoke from back */}
                <div
                    className="animate-van-run absolute top-1/2 flex h-12 w-12 items-center justify-center"
                    style={{ left: 0 }}
                >
                    <div className="relative flex h-full w-full items-center justify-center">
                        {/* Truck */}
                        <Truck
                            className="h-10 w-10 shrink-0 text-emerald-600 drop-shadow-md sm:h-11 sm:w-11 dark:text-emerald-400"
                            strokeWidth={2.5}
                        />
                        {/* Exhaust smoke — at the back (left edge of truck when facing right), drifts backward & up */}
                        <div
                            className="pointer-events-none absolute top-1/2 flex -translate-y-1/2 items-center justify-end gap-1 overflow-visible pr-0.5"
                            style={{
                                left: 0,
                                right: 'calc(50% + 16px)',
                                width: 'auto',
                            }}
                        >
                            <div className="animate-smoke-puff h-3 w-3 rounded-full bg-gray-500 shadow-[0_0_10px_3px_rgba(107,114,128,0.6)] dark:bg-gray-400" />
                            <div className="animate-smoke-puff-2 h-2.5 w-2.5 rounded-full bg-gray-500 shadow-[0_0_8px_2px_rgba(107,114,128,0.55)] dark:bg-gray-400" />
                            <div className="animate-smoke-puff-3 h-3.5 w-3.5 rounded-full bg-gray-500 shadow-[0_0_12px_4px_rgba(107,114,128,0.5)] dark:bg-gray-400" />
                            <div className="animate-smoke-puff-4 h-2 w-2 rounded-full bg-gray-500 shadow-[0_0_8px_2px_rgba(107,114,128,0.55)] dark:bg-gray-400" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
