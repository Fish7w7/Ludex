<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('game_libraries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('platform_id')->nullable()->constrained()->nullOnDelete();
            $table->text('path');
            $table->string('drive_letter', 8)->nullable();
            $table->string('label')->nullable();
            $table->string('source', 40);
            $table->boolean('is_active')->default(true);
            $table->timestamp('last_scanned_at')->nullable();
            $table->timestamps();
            $table->unique(['user_id', 'platform_id', 'path']);
            $table->index(['user_id', 'source']);
            $table->index(['user_id', 'drive_letter']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('game_libraries');
    }
};
