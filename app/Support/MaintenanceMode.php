<?php

namespace App\Support;

use Illuminate\Support\Facades\File;

class MaintenanceMode
{
    protected static string $file;

    public static function filePath(): string
    {
        return storage_path('framework/maintenance_mode');
    }

    public static function isEnabled(): bool
    {
        return File::exists(static::filePath());
    }

    public static function enable(): void
    {
        $dir = dirname(static::filePath());
        if (! File::isDirectory($dir)) {
            File::makeDirectory($dir, 0755, true);
        }
        File::put(static::filePath(), '1');
    }

    public static function disable(): void
    {
        if (File::exists(static::filePath())) {
            File::delete(static::filePath());
        }
    }
}
