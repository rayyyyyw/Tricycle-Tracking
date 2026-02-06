<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LandingPageContent extends Model
{
    protected $fillable = [
        'about_title',
        'about_subtitle',
        'about_paragraphs',
        'about_highlights',
        'team_subtitle',
        'team_members',
    ];

    protected $casts = [
        'about_paragraphs' => 'array',
        'about_highlights' => 'array',
        'team_members' => 'array',
    ];

    /**
     * Get the single landing page content row (singleton).
     */
    public static function get(): self
    {
        $row = static::first();
        if ($row) {
            return $row;
        }
        return static::create(static::defaults());
    }

    /**
     * Default content when none exists.
     */
    public static function defaults(): array
    {
        return [
            'about_title' => 'About TriGo',
            'about_subtitle' => 'Smart tricycle monitoring for modern communities',
            'about_paragraphs' => [
                'TriGo is an IoT-based tricycle monitoring system designed to bring real-time tracking and fleet management to local transport operators.',
                'Built to improve efficiency, safety, and transparency in tricycle operations, TriGo provides a smarter, more connected mobility experience for communities.',
            ],
            'about_highlights' => [
                ['icon' => '👤', 'title' => 'Passengers', 'desc' => 'Book rides, track your tricycle in real time, and pay seamlessly.'],
                ['icon' => '🚲', 'title' => 'Drivers', 'desc' => 'Manage availability, navigate optimized routes, and accept bookings.'],
                ['icon' => '📊', 'title' => 'Admins', 'desc' => 'Oversee the fleet with analytics, smart alerts, and fleet control.'],
            ],
            'team_subtitle' => 'The people behind TriGo',
            'team_members' => [
                ['name' => 'Ray Georpe', 'role' => 'Team Member', 'avatar' => '👨‍💻', 'isAdviser' => false],
                ['name' => 'Team Member 2', 'role' => 'Team Member', 'avatar' => '👩‍💻', 'isAdviser' => false],
                ['name' => 'Team Member 3', 'role' => 'Team Member', 'avatar' => '👨‍💻', 'isAdviser' => false],
                ['name' => 'Adviser Name', 'role' => 'Project Adviser', 'avatar' => '🎓', 'isAdviser' => true],
            ],
        ];
    }
}
