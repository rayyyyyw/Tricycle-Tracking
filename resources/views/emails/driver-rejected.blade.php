<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Update on your TriGo driver application</title>
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
                                        <h1 style="margin: 0 0 8px 0; font-size: 20px; font-weight: 700; color: #111827;">Update on your driver application</h1>
                                        <p style="margin: 0 0 20px 0; font-size: 14px; color: #b91c1c; font-weight: 600;">Your application was not approved</p>
                                        <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #374151;">Hi {{ $userName }},</p>
                                        <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #374151;">
                                            Thank you for your interest in becoming a TriGo driver. After review, we were unable to approve your application at this time.
                                        </p>
                                        @if(!empty($adminNotes))
                                        <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: 600; color: #374151;">Feedback from our team:</p>
                                        <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #374151; padding: 12px; background-color: #fef2f2; border-radius: 8px; border-left: 4px solid #b91c1c;">
                                            {{ $adminNotes }}
                                        </p>
                                        @endif
                                        <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #374151;">
                                            You may reapply after addressing the feedback above. We encourage you to try again once you're ready.
                                        </p>
                                        <table role="presentation" cellspacing="0" cellpadding="0">
                                            <tr>
                                                <td style="background-color: #1f2937; border-radius: 8px;">
                                                    <a href="{{ $appUrl }}/become-driver" style="display: inline-block; padding: 12px 24px; font-size: 14px; font-weight: 600; color: #ffffff; text-decoration: none;">Apply again</a>
                                                </td>
                                            </tr>
                                        </table>
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
