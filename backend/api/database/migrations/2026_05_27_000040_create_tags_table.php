<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tags', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name', 60);
            $table->string('color', 32)->nullable();
            $table->timestamps();
            $table->unique(['user_id', 'name']);
        });

        Schema::create('tag_user_game', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tag_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_game_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['tag_id', 'user_game_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tag_user_game');
        Schema::dropIfExists('tags');
    }
};

