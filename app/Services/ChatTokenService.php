<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

class ChatTokenService
{
    public function create(int $userId, int $bookingId): string
    {
        $ttl = (int) config('services.chat.token_ttl_minutes', 60);
        $payload = [
            'user_id' => $userId,
            'booking_id' => $bookingId,
            'exp' => time() + ($ttl * 60),
        ];
        $payloadB64 = $this->base64UrlEncode(json_encode($payload));
        $secret = (string) config('services.chat.token_secret');
        $sig = hash_hmac('sha256', $payloadB64, $secret, true);
        $sigB64 = $this->base64UrlEncode($sig);

        return $payloadB64 . '.' . $sigB64;
    }

    /**
     * @return array{user_id: int, booking_id: int}|null
     */
    public function validate(string $token): ?array
    {
        $parts = explode('.', $token);
        if (count($parts) !== 2) {
            return null;
        }
        [$payloadB64, $sigB64] = $parts;
        $secret = (string) config('services.chat.token_secret');
        $expectedSig = $this->base64UrlEncode(hash_hmac('sha256', $payloadB64, $secret, true));
        if (!hash_equals($expectedSig, $sigB64)) {
            return null;
        }
        $raw = $this->base64UrlDecode($payloadB64);
        if ($raw === null) {
            return null;
        }
        $payload = json_decode($raw, true);
        if (!is_array($payload) || empty($payload['user_id']) || empty($payload['booking_id'])) {
            return null;
        }
        if (!empty($payload['exp']) && (int) $payload['exp'] < time()) {
            return null;
        }
        return [
            'user_id' => (int) $payload['user_id'],
            'booking_id' => (int) $payload['booking_id'],
        ];
    }

    private function base64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private function base64UrlDecode(string $data): ?string
    {
        $pad = strlen($data) % 4;
        if ($pad) {
            $data .= str_repeat('=', 4 - $pad);
        }
        $dec = base64_decode(strtr($data, '-_', '+/'), true);

        return $dec === false ? null : $dec;
    }
}
