<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="refresh" content="30">
    <title>Under Maintenance - TriGo</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet">
    <style>
        :root {
            --ease: cubic-bezier(0.4, 0, 0.2, 1);
            --green-50: #f0fdf4;
            --green-100: #dcfce7;
            --green-500: #22c55e;
            --green-600: #16a34a;
            --emerald-500: #10b981;
            --emerald-600: #059669;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'DM Sans', system-ui, sans-serif;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(165deg, #f0fdf4 0%, #dcfce7 50%, #d1fae5 100%);
            padding: 2rem;
        }

        .card {
            max-width: 28rem;
            width: 100%;
            background: #fff;
            border-radius: 1.5rem;
            padding: 2.5rem;
            box-shadow: 0 4px 20px -5px rgba(16,185,129,0.15), 0 10px 40px -15px rgba(5,150,105,0.1);
            border: 1px solid rgba(16,185,129,0.12);
            animation: fadeIn 0.7s var(--ease) forwards;
            opacity: 0;
        }
        @keyframes fadeIn {
            to { opacity: 1; }
        }

        .badge {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: var(--green-100);
            color: var(--emerald-600);
            font-size: 0.8125rem;
            font-weight: 600;
            padding: 0.5rem 1rem;
            border-radius: 9999px;
            margin-bottom: 1.5rem;
        }
        .badge-dot {
            width: 6px;
            height: 6px;
            background: var(--emerald-600);
            border-radius: 50%;
            animation: pulse 2.5s var(--ease) infinite;
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.6; transform: scale(1.2); }
        }

        .illustration {
            height: 120px;
            margin: 1.5rem 0 2rem;
            background: linear-gradient(135deg, var(--green-50) 0%, var(--green-100) 100%);
            border-radius: 1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid rgba(16,185,129,0.08);
        }

        .icon-wrap {
            width: 72px;
            height: 72px;
            background: linear-gradient(135deg, var(--emerald-500) 0%, var(--green-600) 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: softPulse 3s var(--ease) infinite;
        }
        @keyframes softPulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.04); opacity: 0.95; }
        }

        .icon {
            width: 28px;
            height: 28px;
            border: 2px solid #fff;
            border-radius: 50%;
            border-top-color: transparent;
            animation: spin 2s linear infinite;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        h1 {
            font-size: 1.5rem;
            font-weight: 600;
            color: #111827;
            margin-bottom: 0.5rem;
            letter-spacing: -0.02em;
        }

        .subtitle {
            color: var(--emerald-600);
            font-size: 0.9375rem;
            font-weight: 500;
            margin-bottom: 1rem;
        }

        .message {
            color: #6b7280;
            font-size: 0.9375rem;
            line-height: 1.65;
        }

        .refresh {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            margin-top: 1.75rem;
            padding-top: 1.5rem;
            border-top: 1px solid #f3f4f6;
            font-size: 0.8125rem;
            color: #9ca3af;
        }

        .dot {
            width: 5px;
            height: 5px;
            background: var(--emerald-500);
            border-radius: 50%;
            animation: dotPulse 1.2s var(--ease) infinite;
        }
        .dot:nth-child(2) { animation-delay: 0.15s; }
        .dot:nth-child(3) { animation-delay: 0.3s; }
        @keyframes dotPulse {
            0%, 100% { opacity: 0.4; transform: scale(0.9); }
            50% { opacity: 1; transform: scale(1.1); }
        }

        .brand {
            margin-top: 1.5rem;
            font-size: 0.875rem;
            font-weight: 600;
            color: var(--emerald-600);
        }
    </style>
</head>
<body>
    <div class="card">
        <div class="badge">
            <span class="badge-dot"></span>
            Under Maintenance Break
        </div>

        <div class="illustration">
            <div class="icon-wrap">
                <div class="icon"></div>
            </div>
        </div>

        <h1>We'll be back shortly</h1>
        <p class="subtitle">TriGo is currently under maintenance</p>
        <p class="message">We're taking a short break to improve things. Please check back in a moment. Thank you for your patience.</p>

        <div class="refresh">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
            <span>Checking every 30 seconds</span>
        </div>

        <p class="brand">TriGo</p>
    </div>
</body>
</html>
