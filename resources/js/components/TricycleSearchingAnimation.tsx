import { Truck } from 'lucide-react';

/**
 * Van/truck animation: runs from Point A (left) to Point B (right) and back in a loop.
 * Used on "Looking for a driver" waiting state. Slightly slower, longer route.
 */
export default function TricycleSearchingAnimation() {
  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Point labels */}
      <div className="flex justify-between text-xs font-semibold text-muted-foreground mb-1 px-1">
        <span className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded">
          A · Pickup
        </span>
        <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">
          B · Destination
        </span>
      </div>

      {/* Track + van */}
      <div className="relative h-20 sm:h-24 px-2">
        {/* Road / track — longer route */}
        <div className="absolute left-2 right-2 top-1/2 -translate-y-1/2 h-3 sm:h-4 rounded-full bg-gray-200 dark:bg-gray-700" />

        {/* Van — animates A → B → A (loop), slower + smoke from back */}
        <div
          className="absolute top-1/2 w-12 h-12 flex items-center justify-center animate-van-run"
          style={{ left: 0 }}
        >
          <div className="relative flex items-center justify-center w-full h-full">
            {/* Truck */}
            <Truck className="w-10 h-10 sm:w-11 sm:h-11 text-emerald-600 dark:text-emerald-400 drop-shadow-md shrink-0" strokeWidth={2.5} />
            {/* Exhaust smoke — at the back (left edge of truck when facing right), drifts backward & up */}
            <div
              className="absolute top-1/2 -translate-y-1/2 flex items-center justify-end gap-1 pr-0.5 pointer-events-none overflow-visible"
              style={{ left: 0, right: 'calc(50% + 16px)', width: 'auto' }}
            >
              <div className="w-3 h-3 rounded-full bg-gray-500 dark:bg-gray-400 animate-smoke-puff shadow-[0_0_10px_3px_rgba(107,114,128,0.6)]" />
              <div className="w-2.5 h-2.5 rounded-full bg-gray-500 dark:bg-gray-400 animate-smoke-puff-2 shadow-[0_0_8px_2px_rgba(107,114,128,0.55)]" />
              <div className="w-3.5 h-3.5 rounded-full bg-gray-500 dark:bg-gray-400 animate-smoke-puff-3 shadow-[0_0_12px_4px_rgba(107,114,128,0.5)]" />
              <div className="w-2 h-2 rounded-full bg-gray-500 dark:bg-gray-400 animate-smoke-puff-4 shadow-[0_0_8px_2px_rgba(107,114,128,0.55)]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
