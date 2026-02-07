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

        <link rel="icon" href="/logos/appicon.png" type="image/png">
        <link rel="apple-touch-icon" href="/logos/appicon.png">

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
