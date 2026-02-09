import TriGoLogoImg from '@/components/TriGoLogoImg';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

const funnyLines = [
    "Our GPS says you're {km} km off route. 😅",
    "Even our best driver couldn't find this one. 🧭",
    "This route wasn't in the fare calculator. 📍",
    'The tricycle driver took a coffee break here. ☕',
];

export default function NotFound404() {
    const [randomLine] = useState(() => {
        const km = Math.floor(Math.random() * 99 + 1);
        return funnyLines[
            Math.floor(Math.random() * funnyLines.length)
        ].replace('{km}', String(km));
    });

    return (
        <>
            <Head title="404 - Page Not Found | TriGo" />
            <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-linear-to-br from-green-50 via-white to-emerald-50 px-4 py-12 dark:from-gray-900 dark:via-gray-900 dark:to-emerald-950">
                {/* Floating blobs - more dynamic */}
                <div className="pointer-events-none fixed inset-0 overflow-hidden">
                    <div className="animate-blob absolute -top-20 -left-20 h-72 w-72 rounded-full bg-green-200/40 blur-3xl dark:bg-green-800/25" />
                    <div className="animate-blob animation-delay-2000 absolute -right-20 -bottom-20 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl dark:bg-emerald-800/25" />
                    <div className="animate-blob-slow absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-100/50 blur-3xl dark:bg-green-900/20" />
                </div>

                {/* Road doodle - dashed line suggesting wrong turn */}
                <div className="pointer-events-none absolute top-1/2 left-0 w-full opacity-15 dark:opacity-10">
                    <div className="mx-auto max-w-md border-t-2 border-dashed border-green-400 dark:border-green-500" />
                </div>

                <div className="animate-fade-in relative z-10 max-w-xl text-center">
                    {/* Logo with hover lift */}
                    <Link
                        href="/"
                        className="mb-10 inline-block transition-transform hover:-translate-y-0.5"
                    >
                        <TriGoLogoImg
                            size="2xl"
                            className="mx-auto opacity-95 drop-shadow-sm transition-opacity hover:opacity-100"
                        />
                    </Link>

                    {/* 404 - bigger, bouncier treatment */}
                    <div className="mb-2">
                        <span
                            className="animate-bounce-slow inline-block text-8xl font-extrabold tracking-tighter text-green-500/90 select-none sm:text-9xl dark:text-green-400/90"
                            style={{
                                textShadow: '0 4px 0 rgba(34, 197, 94, 0.2)',
                            }}
                        >
                            4
                        </span>
                        <span className="animate-bounce-slow animation-delay-2000 inline-block text-8xl font-extrabold tracking-tighter text-emerald-500/90 select-none sm:text-9xl dark:text-emerald-400/90">
                            0
                        </span>
                        <span className="animate-bounce-slow animation-delay-3000 inline-block text-8xl font-extrabold tracking-tighter text-green-500/90 select-none sm:text-9xl dark:text-green-400/90">
                            4
                        </span>
                    </div>

                    {/* Tricycle - lost but vibing */}
                    <div className="mb-6 flex justify-center gap-1">
                        <span className="text-4xl opacity-60">📍</span>
                        <span className="animate-bounce-slow text-5xl sm:text-6xl">
                            🛺
                        </span>
                        <span className="scale-x-[-1] transform text-4xl opacity-60">
                            ❓
                        </span>
                    </div>

                    {/* Card container for copy */}
                    <div className="mb-8 rounded-2xl border border-green-100/80 bg-white/70 p-6 shadow-lg shadow-green-100/50 backdrop-blur-md sm:rounded-3xl sm:p-8 dark:border-green-800/30 dark:bg-gray-800/50 dark:shadow-none">
                        <h1 className="mb-2 text-xl font-bold text-gray-800 sm:text-2xl dark:text-gray-100">
                            Looks like this tricycle took a wrong turn
                        </h1>
                        <p className="text-sm leading-relaxed text-gray-600 sm:text-base dark:text-gray-300">
                            The page you're looking for seems to have run out of
                            gas. No worries though — hop in and we'll get you
                            back on track!
                        </p>
                    </div>

                    {/* CTA - more playful */}
                    <Link
                        href="/"
                        className="group inline-flex items-center gap-2 rounded-2xl bg-green-500 px-8 py-4 font-semibold text-white shadow-xl shadow-green-500/25 transition-all duration-300 hover:scale-105 hover:bg-green-600 hover:shadow-2xl hover:shadow-green-500/30 active:scale-100 dark:bg-green-600 dark:hover:bg-green-700"
                    >
                        <span className="text-xl">🛺</span>
                        <span>Take me home!</span>
                        <svg
                            className="h-5 w-5 transition-transform group-hover:translate-x-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 7l5 5m0 0l-5 5m5-5H6"
                            />
                        </svg>
                    </Link>

                    {/* Easter egg - random funny line */}
                    <p className="mt-10 text-xs text-gray-400 italic sm:text-sm dark:text-gray-500">
                        {randomLine}
                    </p>
                </div>
            </div>
        </>
    );
}
