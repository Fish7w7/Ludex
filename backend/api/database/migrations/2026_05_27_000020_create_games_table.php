<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('games', function (Blueprint $table) {
            $table->id();
            $table->foreignId('platform_id')->nullable()->constrained()->nullOnDelete();
            $table->string('external_id')->nullable()->index();
            $table->string('name');
            $table->string('slug')->index();
            $table->text('cover_url')->nullable();
            $table->text('description')->nullable();
            $table->date('release_date')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->unique(['platform_id', 'external_id']);
            $table->unique(['platform_id', 'slug']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('games');
    }
};
