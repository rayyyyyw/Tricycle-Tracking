import { Head, Link } from '@inertiajs/react';
import { useMemo } from 'react';
import TriGoLogoImg from '@/components/TriGoLogoImg';

export default function NotFound404() {
    const offRouteKm = useMemo(() => Math.floor(Math.random() * 99 + 1), []);
    return (
        <>
            <Head title="404 - Page Not Found | TriGo" />
            <div className="min-h-screen bg-linear-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-900 dark:to-emerald-950 flex flex-col items-center justify-center px-4 py-12">
                {/* Subtle floating blobs */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-20 -left-20 w-64 h-64 bg-green-200/30 dark:bg-green-800/20 rounded-full blur-3xl" />
                    <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-emerald-200/30 dark:bg-emerald-800/20 rounded-full blur-3xl" />
                </div>

                <div className="relative z-10 text-center max-w-lg">
                    {/* Logo */}
                    <Link href="/" className="inline-block mb-8">
                        <TriGoLogoImg size="lg" className="mx-auto opacity-90 hover:opacity-100 transition-opacity" />
                    </Link>

                    {/* 404 with a twist */}
                    <div className="mb-4">
                        <span className="text-7xl sm:text-8xl font-bold text-green-500/90 dark:text-green-400/90 select-none">404</span>
                    </div>

                    {/* Tricycle emoji - lost on the road */}
                    <div className="text-5xl sm:text-6xl mb-6 animate-bounce-slow">🛺</div>

                    {/* Funny but subtle copy */}
                    <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                        Looks like this tricycle took a wrong turn
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base mb-8">
                        The page you're looking for seems to have run out of gas. Let's get you back on track.
                    </p>

                    {/* CTA */}
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-lg hover:shadow-xl dark:bg-green-600 dark:hover:bg-green-700"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Back to home
                    </Link>

                    {/* Tiny easter egg */}
                    <p className="mt-12 text-[10px] sm:text-xs text-gray-400 dark:text-gray-500">
                        * Our GPS says you're {offRouteKm} km off route. 😅
                    </p>
                </div>
            </div>
        </>
    );
}
