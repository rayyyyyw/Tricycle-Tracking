<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Congratulations – You're a TriGo Driver!</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f3f4f6; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 480px;">
                    {{-- Header with TriGo logo --}}
                    <tr>
                        <td align="center" style="padding-bottom: 32px;">
                            <img src="{{ $appUrl }}/logos/tlogo.png" alt="TriGo" width="120" height="120" style="display: block; max-width: 120px; height: auto;" />
                        </td>
                    </tr>
                    {{-- Card --}}
                    <tr>
                        <td style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1); overflow: hidden;">
                            {{-- Accent bar --}}
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td style="height: 4px; background-color: #059669;"></td>
                                </tr>
                            </table>
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding: 32px 28px;">
                                <tr>
                                    <td>
                                        <h1 style="margin: 0 0 8px 0; font-size: 20px; font-weight: 700; color: #111827;">Congratulations! You're a TriGo Driver</h1>
                                        <p style="margin: 0 0 20px 0; font-size: 14px; color: #059669; font-weight: 600;">Your application has been approved</p>
                                        <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #374151;">Hi {{ $userName }},</p>
                                        <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #374151;">
                                            Welcome to the TriGo driver team! You can now access the driver dashboard, accept ride requests, and start earning. We're excited to have you on board.
                                        </p>
                                        <table role="presentation" cellspacing="0" cellpadding="0">
                                            <tr>
                                                <td style="background-color: #059669; border-radius: 8px;">
                                                    <a href="{{ $appUrl }}/driver/bookings" style="display: inline-block; padding: 12px 24px; font-size: 14px; font-weight: 600; color: #ffffff; text-decoration: none;">Go to Driver Dashboard</a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    {{-- Footer --}}
                    <tr>
                        <td align="center" style="padding-top: 24px;">
                            <p style="margin: 0; font-size: 12px; color: #9ca3af;">— TriGo · Smart Tricycle Tracking</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
