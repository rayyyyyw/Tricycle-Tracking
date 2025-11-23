<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('nav_admins', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('avatar')->nullable();
            $table->json('settings')->nullable();
            $table->string('theme')->default('system');
            $table->json('notification_preferences')->nullable();
            $table->timestamps();
            
            // Ensure one-to-one relationship
            $table->unique('user_id');
        });
    }

    public function down()
    {
        Schema::dropIfExists('nav_admins');
    }
};