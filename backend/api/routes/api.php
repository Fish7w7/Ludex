<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\FavoriteController;
use App\Http\Controllers\GameController;
use App\Http\Controllers\GameLibraryController;
use App\Http\Controllers\PlatformController;
use App\Http\Controllers\PlaySessionController;
use App\Http\Controllers\ScanLogController;
use App\Http\Controllers\TagController;
use App\Http\Controllers\UserGameController;
use Illuminate\Support\Facades\Route;

Route::get('/health', fn () => ['status' => 'ok', 'name' => 'Ludex', 'signature' => 'ピコ~']);

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:10,1');
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:10,1');
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    Route::apiResource('platforms', PlatformController::class)->only(['index']);
    Route::apiResource('games', GameController::class)->except(['create', 'edit']);
    Route::apiResource('game-libraries', GameLibraryController::class)->except(['create', 'edit']);

    Route::post('/user-games/sync', [UserGameController::class, 'sync']);
    Route::apiResource('user-games', UserGameController::class)->except(['create', 'edit']);
    Route::post('/user-games/{userGame}/favorite', [FavoriteController::class, 'store']);
    Route::delete('/user-games/{userGame}/favorite', [FavoriteController::class, 'destroy']);
    Route::post('/user-games/{userGame}/play-sessions/start', [PlaySessionController::class, 'start']);
    Route::post('/user-games/{userGame}/play-sessions/finish', [PlaySessionController::class, 'finish']);

    Route::apiResource('tags', TagController::class)->except(['create', 'edit']);

    Route::get('/scans', [ScanLogController::class, 'index']);
    Route::post('/scans', [ScanLogController::class, 'store']);
});
