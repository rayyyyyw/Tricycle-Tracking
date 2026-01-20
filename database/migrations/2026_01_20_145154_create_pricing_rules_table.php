<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('pricing_rules', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('ride_type'); // regular, special, delivery
            $table->decimal('base_fare', 8, 2); // Minimum fare
            $table->decimal('per_km_rate', 8, 2); // Rate per kilometer
            $table->decimal('per_minute_rate', 8, 2)->nullable(); // Rate per minute (optional)
            $table->decimal('minimum_fare', 8, 2); // Minimum charge
            $table->integer('surge_multiplier_percent')->default(0); // Surge pricing percentage (0-300)
            $table->time('peak_hour_start')->nullable(); // Peak hour start
            $table->time('peak_hour_end')->nullable(); // Peak hour end
            $table->integer('peak_hour_multiplier_percent')->default(0); // Peak hour extra charge
            $table->boolean('is_active')->default(true);
            $table->integer('priority')->default(0); // Higher priority rules apply first
            $table->json('conditions')->nullable(); // Additional conditions (weather, holidays, etc.)
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pricing_rules');
    }
};
