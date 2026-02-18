<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'light') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        {{-- Inline script to initialize theme from localStorage immediately to prevent flash --}}
        <script>
            (function() {
                // Landing, login, register use 'landing-theme' - never touch 'appearance'
                // Authenticated pages use 'appearance' - never touch 'landing-theme'
                const path = window.location.pathname;
                const usesLandingTheme = path === '/' || path === '/welcome' || path.startsWith('/welcome') || path === '/login' || path === '/register';
                
                if (usesLandingTheme) {
                    const savedLandingTheme = localStorage.getItem('landing-theme');
                    if (savedLandingTheme === 'dark') {
                        document.documentElement.classList.add('dark');
                    } else {
                        document.documentElement.classList.remove('dark');
                    }
                } else {
                    // Authenticated pages: default to light (not system)
                    const savedAppearance = localStorage.getItem('appearance') || 'light';
                    
                    if (savedAppearance === 'dark') {
                        document.documentElement.classList.add('dark');
                    } else if (savedAppearance === 'system') {
                        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                        document.documentElement.classList.toggle('dark', prefersDark);
                    } else {
                        document.documentElement.classList.remove('dark');
                    }
                }
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: oklch(1 0 0);
            }

            html.dark {
                background-color: oklch(0.145 0 0);
            }
        </style>

        <title inertia>{{ config('app.name', 'Laravel') }}</title>
        
        <meta name="csrf-token" content="{{ csrf_token() }}">

        {{-- Favicon - App Icon --}}
        <link rel="icon" href="/logos/appicon.png?v=3" type="image/png" sizes="any">
        <link rel="shortcut icon" href="/logos/appicon.png?v=3" type="image/png">
        <link rel="icon" type="image/png" sizes="32x32" href="/logos/appicon.png?v=3">
        <link rel="icon" type="image/png" sizes="16x16" href="/logos/appicon.png?v=3">
        <link rel="apple-touch-icon" href="/logos/appicon.png?v=3">
        <link rel="apple-touch-icon" sizes="72x72" href="/logos/appicon.png?v=3">
        <link rel="apple-touch-icon" sizes="96x96" href="/logos/appicon.png?v=3">
        <link rel="apple-touch-icon" sizes="128x128" href="/logos/appicon.png?v=3">
        <link rel="apple-touch-icon" sizes="144x144" href="/logos/appicon.png?v=3">
        <link rel="apple-touch-icon" sizes="152x152" href="/logos/appicon.png?v=3">
        <link rel="apple-touch-icon" sizes="192x192" href="/logos/appicon.png?v=3">
        <link rel="apple-touch-icon" sizes="384x384" href="/logos/appicon.png?v=3">
        <link rel="apple-touch-icon" sizes="512x512" href="/logos/appicon.png?v=3">

        {{-- PWA Meta Tags --}}
        <meta name="theme-color" content="#10b981">
        <meta name="mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
        <meta name="apple-mobile-web-app-title" content="TriGo">
        <meta name="application-name" content="TriGo">
        <meta name="msapplication-TileColor" content="#10b981">
        <meta name="msapplication-tap-highlight" content="no">
        <link rel="manifest" href="/manifest.json">

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />

        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
