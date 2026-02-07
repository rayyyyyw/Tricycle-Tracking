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
        'features',
        'how_it_works',
    ];

    protected $casts = [
        'about_paragraphs' => 'array',
        'about_highlights' => 'array',
        'team_members' => 'array',
        'features' => 'array',
        'how_it_works' => 'array',
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
            'features' => [
                ['icon' => '📍', 'title' => 'Real-time Tracking', 'description' => 'Live GPS location tracking with accurate positioning and route history.'],
                ['icon' => '📊', 'title' => 'Fleet Analytics', 'description' => 'Comprehensive insights into fleet performance and operational metrics.'],
                ['icon' => '🔔', 'title' => 'Smart Alerts', 'description' => 'Instant notifications for maintenance, speed limits, and geofencing.'],
                ['icon' => '🛣️', 'title' => 'Route Optimization', 'description' => 'Smart routing to reduce fuel costs and improve delivery times.'],
                ['icon' => '📱', 'title' => 'Mobile Access', 'description' => 'Monitor your fleet from anywhere with our mobile-friendly dashboard.'],
                ['icon' => '💾', 'title' => 'Data Export', 'description' => 'Export reports and data for analysis and record keeping.'],
            ],
            'how_it_works' => [
                ['step' => '1', 'title' => 'Sign Up', 'desc' => 'Create your account'],
                ['step' => '2', 'title' => 'Add Devices', 'desc' => 'Install IoT trackers'],
                ['step' => '3', 'title' => 'Monitor', 'desc' => 'View your dashboard'],
                ['step' => '4', 'title' => 'Optimize', 'desc' => 'Improve operations'],
            ],
        ];
    }
}
