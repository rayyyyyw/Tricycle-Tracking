<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('landing_page_contents', function (Blueprint $table) {
            if (! Schema::hasColumn('landing_page_contents', 'features')) {
                $table->json('features')->nullable();
            }
            if (! Schema::hasColumn('landing_page_contents', 'how_it_works')) {
                $table->json('how_it_works')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('landing_page_contents', function (Blueprint $table) {
            if (Schema::hasColumn('landing_page_contents', 'features')) {
                $table->dropColumn('features');
            }
            if (Schema::hasColumn('landing_page_contents', 'how_it_works')) {
                $table->dropColumn('how_it_works');
            }
        });
    }
};
