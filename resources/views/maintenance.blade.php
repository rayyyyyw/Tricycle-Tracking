<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="refresh" content="30">
    <title>Under Maintenance - TriGo</title>
    <link rel="icon" href="{{ asset('favicon.ico') }}" type="image/x-icon">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&display=swap" rel="stylesheet">
    <style>
        :root {
            --ease: cubic-bezier(0.4, 0, 0.2, 1);
            --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
            --green-50: #f0fdf4;
            --green-100: #dcfce7;
            --green-200: #bbf7d0;
            --emerald-400: #34d399;
            --emerald-500: #10b981;
            --emerald-600: #059669;
            --emerald-700: #047857;
            --gray-500: #6b7280;
            --gray-600: #4b5563;
            --gray-900: #111827;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { -webkit-font-smoothing: antialiased; }

        body {
            font-family: 'DM Sans', system-ui, sans-serif;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--gray-900);
            padding: 1.5rem;
            position: relative;
            overflow-x: hidden;
        }

        body::before {
            content: '';
            position: absolute;
            inset: 0;
            background:
                radial-gradient(ellipse 80% 50% at 50% -20%, rgba(16, 185, 129, 0.25), transparent),
                radial-gradient(ellipse 60% 40% at 100% 50%, rgba(5, 150, 105, 0.15), transparent),
                radial-gradient(ellipse 50% 30% at 0% 80%, rgba(52, 211, 153, 0.12), transparent);
            pointer-events: none;
        }

        .card {
            position: relative;
            max-width: 26rem;
            width: 100%;
            background: rgba(255, 255, 255, 0.98);
            border-radius: 1.75rem;
            padding: 2.75rem 2.25rem;
            box-shadow:
                0 0 0 1px rgba(255, 255, 255, 0.5),
                0 2px 4px -2px rgba(0, 0, 0, 0.05),
                0 12px 40px -12px rgba(0, 0, 0, 0.12),
                0 32px 80px -24px rgba(5, 150, 105, 0.2);
            animation: cardIn 0.6s var(--ease-out) forwards;
            opacity: 0;
            transform: translateY(8px);
        }
        @media (prefers-reduced-motion: reduce) {
            .card { animation: none; opacity: 1; transform: none; }
        }
        @keyframes cardIn {
            to { opacity: 1; transform: translateY(0); }
        }

        .logo-wrap {
            display: flex;
            justify-content: center;
            margin-bottom: 1.75rem;
        }
        .logo-wrap img {
            width: 4rem;
            height: 4rem;
            object-fit: contain;
            filter: drop-shadow(0 2px 8px rgba(5, 150, 105, 0.15));
        }

        .badge {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: linear-gradient(135deg, var(--green-100) 0%, var(--green-200) 100%);
            color: var(--emerald-700);
            font-size: 0.8125rem;
            font-weight: 600;
            padding: 0.5rem 1rem;
            border-radius: 9999px;
            margin-bottom: 1.5rem;
            box-shadow: 0 1px 2px rgba(5, 150, 105, 0.06);
        }
        .badge-dot {
            width: 6px;
            height: 6px;
            background: var(--emerald-500);
            border-radius: 50%;
            animation: pulse 2.5s var(--ease) infinite;
        }
        @media (prefers-reduced-motion: reduce) {
            .badge-dot { animation: none; }
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.6; transform: scale(1.2); }
        }

        .illustration {
            height: 8rem;
            margin: 1.5rem 0 2rem;
            background: linear-gradient(165deg, var(--green-50) 0%, var(--green-100) 100%);
            border-radius: 1.25rem;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            overflow: hidden;
        }
        .illustration::before {
            content: '';
            position: absolute;
            inset: 0;
            background: radial-gradient(circle at 50% 50%, rgba(255,255,255,0.4) 0%, transparent 60%);
            pointer-events: none;
        }

        .icon-wrap {
            position: relative;
            width: 4rem;
            height: 4rem;
            background: linear-gradient(145deg, var(--emerald-400) 0%, var(--emerald-600) 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 16px rgba(5, 150, 105, 0.35);
            animation: softPulse 2.5s var(--ease) infinite;
        }
        @media (prefers-reduced-motion: reduce) {
            .icon-wrap { animation: none; }
        }
        @keyframes softPulse {
            0%, 100% { transform: scale(1); box-shadow: 0 4px 16px rgba(5, 150, 105, 0.35); }
            50% { transform: scale(1.03); box-shadow: 0 6px 20px rgba(5, 150, 105, 0.4); }
        }

        .icon {
            width: 1.5rem;
            height: 1.5rem;
            border: 2.5px solid #fff;
            border-radius: 50%;
            border-top-color: transparent;
            animation: spin 1.6s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
            .icon { animation: none; opacity: 0.9; }
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        .copy {
            text-align: center;
        }

        h1 {
            font-size: 1.625rem;
            font-weight: 600;
            color: var(--gray-900);
            margin-bottom: 0.5rem;
            letter-spacing: -0.03em;
            line-height: 1.3;
        }

        .subtitle {
            color: var(--emerald-600);
            font-size: 0.9375rem;
            font-weight: 500;
            margin-bottom: 1rem;
        }
        .subtitle strong { font-weight: 600; }

        .message {
            color: var(--gray-600);
            font-size: 0.9375rem;
            line-height: 1.7;
            max-width: 20rem;
            margin: 0 auto;
        }

        .brand {
            margin-top: 2.25rem;
            padding-top: 1.5rem;
            border-top: 1px solid rgba(16, 185, 129, 0.12);
            font-size: 0.9375rem;
            font-weight: 600;
            color: var(--emerald-600);
            letter-spacing: 0.02em;
        }
    </style>
</head>
<body>
    <div class="card" role="main">
        <div class="logo-wrap">
            <img src="{{ asset('logos/tlogo.png') }}" alt="TriGo" width="64" height="64">
        </div>

        <div class="badge" aria-hidden="true">
            <span class="badge-dot"></span>
            Under Maintenance
        </div>

        <div class="illustration" aria-hidden="true">
            <div class="icon-wrap">
                <div class="icon"></div>
            </div>
        </div>

        <div class="copy">
            <h1>We'll be back shortly</h1>
            <p class="subtitle"><strong>TriGo</strong> is currently under maintenance</p>
            <p class="message">We're taking a short break to improve things. Please check back in a moment. Thank you for your patience.</p>
        </div>

        <p class="brand" aria-hidden="true">TriGo</p>
    </div>
</body>
</html>
