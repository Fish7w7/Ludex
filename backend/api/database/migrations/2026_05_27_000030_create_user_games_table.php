<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_games', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('game_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('platform_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('library_id')->nullable()->constrained('game_libraries')->nullOnDelete();
            $table->string('source', 40);
            $table->text('install_path');
            $table->text('executable_path')->nullable();
            $table->text('launch_command')->nullable();
            $table->boolean('is_favorite')->default(false);
            $table->timestamp('last_played_at')->nullable();
            $table->unsignedBigInteger('total_playtime_seconds')->default(0);
            $table->string('external_id')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->index(['user_id', 'source']);
            $table->index(['user_id', 'executable_path']);
            $table->unique(['user_id', 'platform_id', 'external_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_games');
    }
};
