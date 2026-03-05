/**
 * Builds a print-friendly HTML receipt for a completed ride.
 * Uses TriGo logo and clean layout; open in new window for Print / Save as PDF.
 */

export interface ReceiptBooking {
    booking_id: string;
    pickup_address: string;
    destination_address: string;
    total_fare: number | string;
    completed_at: string;
    review: { rating: number; comment: string | null } | null;
}

export type ReceiptVariant = 'passenger' | 'driver';

export interface ReceiptOptions {
    variant: ReceiptVariant;
    booking: ReceiptBooking;
    /** e.g. driver name for passenger receipt, passenger name for driver receipt */
    otherPartyName: string;
    /** Optional; used for driver receipt (passenger phone) */
    otherPartyPhone?: string;
    /** Full URL to logo image (e.g. origin + '/logos/tlogo.png') */
    logoUrl: string;
}

const receiptStyles = `
* { box-sizing: border-box; }
body {
    font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    line-height: 1.5;
    color: #374151;
    background: #f3f4f6;
    margin: 0;
    padding: 24px 16px;
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
}
@media (max-width: 480px) {
    body { padding: 12px 10px; font-size: 13px; }
    .receipt { max-width: 100%; border-radius: 12px; }
    .receipt-brand { padding: 20px 16px 16px; }
    .receipt-brand img { height: 48px; }
    .receipt-brand .brand-name { font-size: 18px; }
    .receipt-id-bar { padding: 10px 16px; gap: 6px; }
    .receipt-body { padding: 16px; }
    .row-label { min-width: 72px; font-size: 11px; }
    .row-value { font-size: 12px; }
    .total-value { font-size: 18px; }
    .footer { padding: 16px; font-size: 11px; }
    .no-print { padding: 0 16px 16px; }
    .btn-print { padding: 10px 20px; font-size: 13px; width: 100%; max-width: 280px; }
}
@media print {
    body { background: #fff; padding: 16px; }
}
.receipt {
    max-width: 420px;
    margin: 0 auto;
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 4px 6px -1px rgba(0,0,0,.08), 0 2px 4px -2px rgba(0,0,0,.06);
    overflow: hidden;
    border: 1px solid #e5e7eb;
}
@media print {
    .receipt { box-shadow: none; border: 1px solid #d1d5db; border-radius: 12px; }
}
.receipt-brand {
    padding: 28px 24px 24px;
    text-align: center;
    border-bottom: 1px solid #f3f4f6;
    background: linear-gradient(180deg, #fafafa 0%, #fff 100%);
}
.receipt-brand img {
    height: 56px;
    width: auto;
    display: block;
    margin: 0 auto 10px;
    object-fit: contain;
}
.receipt-brand .brand-name {
    font-size: 20px;
    font-weight: 700;
    color: #059669;
    letter-spacing: -0.02em;
    margin: 0;
}
.receipt-brand .brand-tagline {
    font-size: 12px;
    color: #6b7280;
    margin: 4px 0 0;
}
.receipt-id-bar {
    padding: 12px 24px;
    background: #f9fafb;
    border-bottom: 1px solid #f3f4f6;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
}
.receipt-id {
    font-family: ui-monospace, 'SF Mono', monospace;
    font-size: 14px;
    font-weight: 600;
    color: #111827;
}
.receipt-date {
    font-size: 13px;
    color: #6b7280;
}
.receipt-body { padding: 20px 24px 24px; }
.section-title {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: #9ca3af;
    margin: 16px 0 10px;
}
.section-title:first-child { margin-top: 0; }
.row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 10px 0;
    border-bottom: 1px solid #f3f4f6;
    gap: 12px;
}
.row:last-child { border-bottom: none; }
.row-label {
    font-size: 12px;
    font-weight: 500;
    color: #6b7280;
    flex-shrink: 0;
    min-width: 88px;
}
.row-value {
    font-size: 13px;
    color: #111827;
    text-align: right;
    word-break: break-word;
}
.total-row {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 2px solid #e5e7eb;
    display: flex;
    justify-content: space-between;
    align-items: baseline;
}
.total-label { font-size: 14px; font-weight: 600; color: #374151; }
.total-value { font-size: 22px; font-weight: 700; color: #059669; letter-spacing: -0.02em; }
.rating-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 0;
    border-bottom: 1px solid #f3f4f6;
}
.rating-stars { color: #eab308; font-size: 14px; letter-spacing: 1px; }
.rating-value { font-size: 13px; color: #374151; font-weight: 500; }
.rating-comment { font-size: 12px; color: #6b7280; font-style: italic; margin-top: 4px; }
.footer {
    padding: 20px 24px;
    border-top: 1px solid #f3f4f6;
    font-size: 12px;
    color: #9ca3af;
    text-align: center;
}
.no-print { padding: 0 24px 24px; text-align: center; }
@media print { .no-print { display: none !important; } }
.btn-print {
    display: inline-block;
    padding: 12px 24px;
    font-size: 14px;
    font-weight: 600;
    color: #fff;
    background: #059669;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    text-decoration: none;
    box-shadow: 0 1px 2px rgba(0,0,0,.06);
}
.btn-print:hover { background: #047857; }
`;

function escapeHtml(text: string): string {
    const div = { textContent: text };
    const el = document.createElement('div');
    el.textContent = text;
    return el.innerHTML;
}

export function buildReceiptHtml(options: ReceiptOptions): string {
    const { variant, booking, otherPartyName, otherPartyPhone, logoUrl } = options;
    const fare = parseFloat(String(booking.total_fare));
    const fareFormatted = Number.isNaN(fare) ? '0.00' : fare.toFixed(2);
    const dateFormatted = new Date(booking.completed_at).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
    const otherPartyLabel = variant === 'passenger' ? 'Driver' : 'Passenger';

    const ratingHtml = booking.review
        ? `
        <div class="rating-row">
            <span class="rating-stars">${'★'.repeat(booking.review.rating)}${'☆'.repeat(5 - booking.review.rating)}</span>
            <span class="rating-value">${escapeHtml(String(booking.review.rating))}/5</span>
        </div>
        ${booking.review.comment ? `<p class="rating-comment">"${escapeHtml(booking.review.comment)}"</p>` : ''}
        `
        : '<div class="row"><span class="row-label">Rating</span><span class="row-value">—</span></div>';

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TriGo Receipt – ${escapeHtml(booking.booking_id)}</title>
    <style>${receiptStyles}</style>
</head>
<body>
    <div class="receipt">
        <div class="receipt-brand">
            <img src="${escapeHtml(logoUrl)}" alt="TriGo" />
            <p class="brand-name"></p>
            <p class="brand-tagline">Ride Receipt</p>
        </div>
        <div class="receipt-id-bar">
            <span class="receipt-id">${escapeHtml(booking.booking_id)}</span>
            <span class="receipt-date">${escapeHtml(dateFormatted)}</span>
        </div>
        <div class="receipt-body">
            <p class="section-title">Trip details</p>
            <div class="row">
                <span class="row-label">${otherPartyLabel}</span>
                <span class="row-value">${escapeHtml(otherPartyName)}</span>
            </div>
            ${otherPartyPhone ? `<div class="row"><span class="row-label">Contact</span><span class="row-value">${escapeHtml(otherPartyPhone)}</span></div>` : ''}
            <div class="row">
                <span class="row-label">Pickup</span>
                <span class="row-value">${escapeHtml(booking.pickup_address)}</span>
            </div>
            <div class="row">
                <span class="row-label">Destination</span>
                <span class="row-value">${escapeHtml(booking.destination_address)}</span>
            </div>
            <p class="section-title">Payment</p>
            <div class="total-row">
                <span class="total-label">Total fare</span>
                <span class="total-value">₱${escapeHtml(fareFormatted)}</span>
            </div>
            <p class="section-title">Rating</p>
            ${ratingHtml}
        </div>
        <div class="footer">
            Thank you for using TriGo
        </div>
    </div>
    <div class="no-print">
        <button type="button" onclick="window.print();" class="btn-print">Print / Save as PDF</button>
    </div>
</body>
</html>`;
}

/** Open receipt in a new window for printing or saving as PDF. */
export function openReceiptInNewWindow(html: string): void {
    const w = window.open('', '_blank', 'noopener,noreferrer');
    if (!w) {
        // Popup blocked; fallback: download as HTML file
        const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'TriGo-Receipt.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return;
    }
    w.document.write(html);
    w.document.close();
}
