import { Head, Link } from '@inertiajs/react';
import { useMemo } from 'react';
import TriGoLogoImg from '@/components/TriGoLogoImg';

const funnyLines = [
    "Our GPS says you're {km} km off route. 😅",
    "Even our best driver couldn't find this one. 🧭",
    "This route wasn't in the fare calculator. 📍",
    "The tricycle driver took a coffee break here. ☕",
];

export default function NotFound404() {
    const offRouteKm = useMemo(() => Math.floor(Math.random() * 99 + 1), []);
    const randomLine = useMemo(
        () => funnyLines[Math.floor(Math.random() * funnyLines.length)].replace('{km}', String(offRouteKm)),
        [offRouteKm]
    );

    return (
        <>
            <Head title="404 - Page Not Found | TriGo" />
            <div className="min-h-screen bg-linear-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-900 dark:to-emerald-950 flex flex-col items-center justify-center px-4 py-12 overflow-hidden relative">
                {/* Floating blobs - more dynamic */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-20 -left-20 w-72 h-72 bg-green-200/40 dark:bg-green-800/25 rounded-full blur-3xl animate-blob" />
                    <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-emerald-200/40 dark:bg-emerald-800/25 rounded-full blur-3xl animate-blob animation-delay-2000" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-green-100/50 dark:bg-green-900/20 rounded-full blur-3xl animate-blob-slow" />
                </div>

                {/* Road doodle - dashed line suggesting wrong turn */}
                <div className="absolute top-1/2 left-0 w-full pointer-events-none opacity-15 dark:opacity-10">
                    <div className="max-w-md mx-auto border-t-2 border-dashed border-green-400 dark:border-green-500" />
                </div>

                <div className="relative z-10 text-center max-w-xl animate-fade-in">
                    {/* Logo with hover lift */}
                    <Link
                        href="/"
                        className="inline-block mb-10 hover:-translate-y-0.5 transition-transform"
                    >
                        <TriGoLogoImg size="xl" className="mx-auto opacity-95 hover:opacity-100 transition-opacity drop-shadow-sm" />
                    </Link>

                    {/* 404 - bigger, bouncier treatment */}
                    <div className="mb-2">
                        <span className="inline-block text-8xl sm:text-9xl font-extrabold text-green-500/90 dark:text-green-400/90 select-none tracking-tighter animate-bounce-slow" style={{ textShadow: '0 4px 0 rgba(34, 197, 94, 0.2)' }}>
                            4
                        </span>
                        <span className="inline-block text-8xl sm:text-9xl font-extrabold text-emerald-500/90 dark:text-emerald-400/90 select-none tracking-tighter animate-bounce-slow animation-delay-2000">
                            0
                        </span>
                        <span className="inline-block text-8xl sm:text-9xl font-extrabold text-green-500/90 dark:text-green-400/90 select-none tracking-tighter animate-bounce-slow animation-delay-3000">
                            4
                        </span>
                    </div>

                    {/* Tricycle - lost but vibing */}
                    <div className="flex justify-center gap-1 mb-6">
                        <span className="text-4xl opacity-60">📍</span>
                        <span className="text-5xl sm:text-6xl animate-bounce-slow">🛺</span>
                        <span className="text-4xl opacity-60 transform scale-x-[-1]">❓</span>
                    </div>

                    {/* Card container for copy */}
                    <div className="bg-white/70 dark:bg-gray-800/50 backdrop-blur-md rounded-2xl sm:rounded-3xl p-6 sm:p-8 mb-8 border border-green-100/80 dark:border-green-800/30 shadow-lg shadow-green-100/50 dark:shadow-none">
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                            Looks like this tricycle took a wrong turn
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base leading-relaxed">
                            The page you're looking for seems to have run out of gas. No worries though — hop in and we'll get you back on track!
                        </p>
                    </div>

                    {/* CTA - more playful */}
                    <Link
                        href="/"
                        className="group inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-xl shadow-green-500/25 hover:shadow-2xl hover:shadow-green-500/30 hover:scale-105 active:scale-100 dark:bg-green-600 dark:hover:bg-green-700"
                    >
                        <span className="text-xl">🛺</span>
                        <span>Take me home!</span>
                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </Link>

                    {/* Easter egg - random funny line */}
                    <p className="mt-10 text-xs sm:text-sm text-gray-400 dark:text-gray-500 italic">
                        {randomLine}
                    </p>
                </div>
            </div>
        </>
    );
}
