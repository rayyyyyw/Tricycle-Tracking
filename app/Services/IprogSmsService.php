<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class IprogSmsService
{
    protected string $apiToken;

    protected string $header;

    protected string $footer;

    protected string $baseUrl = 'https://www.iprogsms.com/api/v1';

    public function __construct()
    {
        $this->apiToken = (string) config('services.iprog_sms.api_token');
        $this->header = (string) config('services.iprog_sms.header', 'CPSU Hinoba-an - TRIGO');
        $this->footer = (string) config('services.iprog_sms.footer', 'TRIGO | Smart Tricycle Tracking System This is an automated message. Please do not reply.');
    }

    /**
     * Build SOS message body only. IPROG template adds header/footer automatically;
     * we must not duplicate them or they appear twice in the SMS.
     * Tone: professional, calm—avoids causing immediate panic.
     */
    public function buildSosMessage(array $data): string
    {
        $passengerName = $data['passenger_name'] ?? 'Unknown';
        $passengerPhone = $data['passenger_phone'] ?? 'N/A';
        $address = $data['address'] ?? 'N/A';
        $lat = $data['latitude'] ?? null;
        $lng = $data['longitude'] ?? null;
        $bookingId = $data['booking_identifier'] ?? $data['booking_id'] ?? 'N/A';
        $driverName = $data['driver_name'] ?? null;
        $driverPhone = $data['driver_phone'] ?? null;
        $vehicleNumber = $data['vehicle_number'] ?? null;
        $time = $data['timestamp'] ?? now()->timezone('Asia/Manila')->format('M j, Y g:i A');

        $coords = ($lat !== null && $lng !== null)
            ? "{$lat},{$lng}"
            : 'N/A';

        $lines = [
            'You may want to check on ' . $passengerName . '. TriGo has received a request for assistance.',
            '',
            "Passenger: {$passengerName}",
            "Phone: {$passengerPhone}",
            "Booking: {$bookingId}",
            "Location: {$address}",
            "Coordinates: {$coords}",
            "Time: {$time}",
        ];

        if ($driverName || $vehicleNumber || $driverPhone) {
            $driverParts = array_filter([
                $driverName,
                $vehicleNumber ? "Vehicle: {$vehicleNumber}" : null,
                $driverPhone ? "Driver: {$driverPhone}" : null,
            ]);
            $lines[] = 'Driver info: ' . implode(' | ', $driverParts);
        }

        return implode("\n", $lines);
    }

    /**
     * Normalize Philippine phone number to 63XXXXXXXXX.
     */
    public function normalizePhone(string $phone): string
    {
        $digits = preg_replace('/\D/', '', $phone);
        if (str_starts_with($digits, '0')) {
            $digits = '63' . substr($digits, 1);
        } elseif (!str_starts_with($digits, '63')) {
            $digits = '63' . $digits;
        }
        return $digits;
    }

    /**
     * Send SMS via IPROG API using form-urlencoded format (as per PHP example).
     *
     * @return array{success: bool, message_id?: string, error?: string}
     */
    public function send(string $phoneNumber, string $message): array
    {
        if (empty($this->apiToken)) {
            Log::warning('IprogSmsService: IPROG_SMS_API_TOKEN not set. Skipping SMS.');
            return ['success' => false, 'error' => 'SMS not configured'];
        }

        $phone = $this->normalizePhone($phoneNumber);

        try {
            // Use form-urlencoded format as shown in IPROG PHP example
            $response = Http::asForm()
                ->timeout(30)
                ->post("{$this->baseUrl}/sms_messages", [
                    'api_token' => $this->apiToken,
                    'phone_number' => $phone,
                    'message' => $message,
                ]);

            $body = $response->json();
            $rawBody = $response->body();

            // Log full response for debugging
            Log::info('IprogSmsService: API Response', [
                'phone' => $phone,
                'http_status' => $response->status(),
                'response_body' => $rawBody,
                'parsed_body' => $body,
            ]);

            // Check for success (status 200 in response body or HTTP 200)
            if ($response->successful()) {
                // IPROG returns status: 200 in the JSON body
                $status = is_array($body) ? ($body['status'] ?? null) : null;
                
                if ($status === 200 || $response->status() === 200) {
                    Log::info('IprogSmsService: SMS sent successfully', [
                        'phone' => $phone,
                        'message_id' => $body['message_id'] ?? null,
                        'api_message' => $body['message'] ?? null,
                    ]);
                    return [
                        'success' => true,
                        'message_id' => $body['message_id'] ?? null,
                    ];
                }
            }

            // Extract error message
            $error = is_array($body) 
                ? ($body['message'] ?? $body['error'] ?? 'Unknown API error')
                : ($rawBody ?: 'No response body');
            
            Log::error('IprogSmsService: SMS failed', [
                'phone' => $phone,
                'http_status' => $response->status(),
                'response_body' => $rawBody,
                'parsed_body' => $body,
                'error' => $error,
            ]);
            
            return ['success' => false, 'error' => $error];
        } catch (\Throwable $e) {
            Log::error('IprogSmsService: SMS exception', [
                'phone' => $phone,
                'exception' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Send SOS SMS to a recipient using the approved template.
     *
     * @return array{success: bool, message_id?: string, error?: string}
     */
    public function sendSos(string $phoneNumber, array $sosData): array
    {
        $message = $this->buildSosMessage($sosData);
        return $this->send($phoneNumber, $message);
    }
}
