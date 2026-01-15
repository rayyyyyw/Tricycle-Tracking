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
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('passenger_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('driver_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('ride_type')->default('regular'); // regular, group, etc.
            $table->integer('passenger_count')->default(1);
            
            // Pickup location
            $table->decimal('pickup_lat', 10, 8);
            $table->decimal('pickup_lng', 11, 8);
            $table->string('pickup_address');
            $table->string('pickup_barangay')->nullable();
            $table->string('pickup_purok')->nullable();
            
            // Destination location
            $table->decimal('destination_lat', 10, 8);
            $table->decimal('destination_lng', 11, 8);
            $table->string('destination_address');
            $table->string('destination_barangay')->nullable();
            $table->string('destination_purok')->nullable();
            
            // Route information
            $table->string('distance')->nullable();
            $table->string('duration')->nullable();
            $table->decimal('fare', 10, 2);
            $table->decimal('total_fare', 10, 2);
            $table->string('estimated_arrival')->nullable();
            
            // Passenger information
            $table->string('passenger_name');
            $table->string('passenger_phone');
            $table->text('special_instructions')->nullable();
            
            // Emergency contact
            $table->string('emergency_contact_name')->nullable();
            $table->string('emergency_contact_phone')->nullable();
            $table->string('emergency_contact_relationship')->nullable();
            
            // Booking status
            $table->enum('status', ['pending', 'accepted', 'in_progress', 'completed', 'cancelled'])->default('pending');
            $table->string('booking_id')->unique(); // Unique booking identifier
            
            $table->timestamp('accepted_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
