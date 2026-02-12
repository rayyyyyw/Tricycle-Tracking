<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your TriGo account has been deactivated</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f3f4f6; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 480px;">
                    <tr>
                        <td align="center" style="padding-bottom: 32px;">
                            <img src="{{ $appUrl }}/logos/tlogo.png" alt="TriGo" width="120" height="120" style="display: block; max-width: 120px; height: auto;" />
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1); overflow: hidden;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td style="height: 4px; background-color: #b91c1c;"></td>
                                </tr>
                            </table>
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding: 32px 28px;">
                                <tr>
                                    <td>
                                        <h1 style="margin: 0 0 8px 0; font-size: 20px; font-weight: 700; color: #111827;">Account deactivated</h1>
                                        <p style="margin: 0 0 20px 0; font-size: 14px; color: #b91c1c; font-weight: 600;">Your TriGo account is temporarily inactive</p>
                                        <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #374151;">Hi {{ $userName }},</p>
                                        <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #374151;">
                                            Your TriGo account has been deactivated by an administrator. You will not be able to sign in until your account is reactivated.
                                        </p>
                                        <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: 600; color: #374151;">Reason provided:</p>
                                        <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #374151; padding: 12px; background-color: #fef2f2; border-radius: 8px; border-left: 4px solid #b91c1c;">
                                            {{ $reason }}
                                        </p>
                                        <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #6b7280;">
                                            If you believe this was done in error, please contact our support team.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
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
