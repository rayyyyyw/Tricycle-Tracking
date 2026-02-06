<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('landing_page_contents', function (Blueprint $table) {
            $table->id();
            $table->string('about_title')->nullable();
            $table->string('about_subtitle')->nullable();
            $table->json('about_paragraphs')->nullable();
            $table->json('about_highlights')->nullable();
            $table->string('team_subtitle')->nullable();
            $table->json('team_members')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('landing_page_contents');
    }
};
