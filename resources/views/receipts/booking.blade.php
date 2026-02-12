<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Receipt – {{ $booking->booking_id }}</title>
    <style>
        * { box-sizing: border-box; }
        body {
            font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
            font-size: 14px;
            line-height: 1.6;
            color: #374151;
            background: #fafafa;
            margin: 0;
            padding: 32px 24px;
            min-height: 100vh;
        }
        @media print {
            body { background: #fff; padding: 24px 20px; }
        }
        .receipt {
            max-width: 420px;
            margin: 0 auto;
            background: #fff;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,.06);
            overflow: hidden;
            border: 1px solid #f3f4f6;
        }
        @media print {
            .receipt { box-shadow: none; border: 1px solid #e5e7eb; }
        }
        .receipt-header {
            padding: 24px 24px 20px;
            border-bottom: 1px solid #f3f4f6;
        }
        .receipt-title {
            font-size: 11px;
            font-weight: 600;
            letter-spacing: 0.04em;
            text-transform: uppercase;
            color: #9ca3af;
            margin: 0 0 2px 0;
        }
        .receipt-id {
            font-family: ui-monospace, 'SF Mono', monospace;
            font-size: 15px;
            font-weight: 600;
            color: #111827;
            margin: 0;
        }
        .receipt-meta {
            margin-top: 10px;
            font-size: 13px;
            color: #6b7280;
        }
        .receipt-meta span { margin-right: 14px; }
        .receipt-body { padding: 20px 24px 24px; }
        .row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding: 10px 0;
            border-bottom: 1px solid #f3f4f6;
            gap: 16px;
        }
        .row:last-of-type { border-bottom: none; }
        .row-label {
            font-size: 12px;
            font-weight: 500;
            color: #9ca3af;
            flex-shrink: 0;
            min-width: 90px;
        }
        .row-value {
            font-size: 13px;
            color: #374151;
            text-align: right;
        }
        .section-title {
            font-size: 11px;
            font-weight: 600;
            letter-spacing: 0.04em;
            text-transform: uppercase;
            color: #9ca3af;
            margin: 20px 0 8px 0;
        }
        .section-title:first-child { margin-top: 0; }
        .total-row {
            margin-top: 16px;
            padding-top: 16px;
            border-top: 1px solid #e5e7eb;
            display: flex;
            justify-content: space-between;
            align-items: baseline;
        }
        .total-label { font-size: 13px; font-weight: 500; color: #6b7280; }
        .total-value { font-size: 20px; font-weight: 600; color: #111827; letter-spacing: -0.02em; }
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
            padding: 10px 20px;
            font-size: 13px;
            font-weight: 500;
            color: #374151;
            background: #fff;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            cursor: pointer;
            text-decoration: none;
        }
        .btn-print:hover { background: #f9fafb; border-color: #9ca3af; }
    </style>
</head>
<body>
    <div class="receipt">
        <div class="receipt-header">
            <p class="receipt-title">Booking receipt</p>
            <p class="receipt-id">{{ $booking->booking_id }}</p>
            <div class="receipt-meta">
                <span>{{ ucfirst(str_replace('_', ' ', $booking->status)) }}</span>
                <span>{{ $booking->created_at->format('M j, Y · g:i A') }}</span>
            </div>
        </div>

        <div class="receipt-body">
            <p class="section-title">Trip details</p>
            <div class="row">
                <span class="row-label">Passenger</span>
                <span class="row-value">{{ $booking->passenger_name }}</span>
            </div>
            @if($booking->passenger)
            <div class="row">
                <span class="row-label">Contact</span>
                <span class="row-value">{{ $booking->passenger->email }}@if($booking->passenger->phone) · {{ $booking->passenger->phone }}@endif</span>
            </div>
            @endif
            <div class="row">
                <span class="row-label">Driver</span>
                <span class="row-value">{{ $booking->driver?->name ?? '—' }}</span>
            </div>
            <div class="row">
                <span class="row-label">Pickup</span>
                <span class="row-value">{{ $booking->pickup_address }}@if($booking->pickup_barangay) ({{ $booking->pickup_barangay }})@endif</span>
            </div>
            <div class="row">
                <span class="row-label">Destination</span>
                <span class="row-value">{{ $booking->destination_address }}@if($booking->destination_barangay) ({{ $booking->destination_barangay }})@endif</span>
            </div>
            <div class="row">
                <span class="row-label">Ride type</span>
                <span class="row-value">{{ ucfirst($booking->ride_type ?? '—') }}</span>
            </div>

            <p class="section-title">Payment</p>
            <div class="row">
                <span class="row-label">Fare</span>
                <span class="row-value">₱{{ number_format($booking->fare, 2) }}</span>
            </div>
            <div class="total-row">
                <span class="total-label">Total</span>
                <span class="total-value">₱{{ number_format($booking->total_fare, 2) }}</span>
            </div>
        </div>

        <div class="footer">
            TriGo · Hinobaan Tricycle
        </div>
    </div>

    <div class="no-print">
        <button type="button" onclick="window.print();" class="btn-print">Print / Save as PDF</button>
    </div>
</body>
</html>
