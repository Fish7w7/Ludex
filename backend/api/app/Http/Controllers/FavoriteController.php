<?php

namespace App\Http\Controllers;

use App\Models\UserGame;
use App\Http\Resources\UserGameResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    public function store(Request $request, UserGame $userGame): JsonResponse
    {
        abort_unless($userGame->user_id === $request->user()->id, 404);

        $userGame->update(['is_favorite' => true]);

        return response()->json(['data' => UserGameResource::make($userGame->fresh(['game', 'platform', 'library']))]);
    }

    public function destroy(Request $request, UserGame $userGame): JsonResponse
    {
        abort_unless($userGame->user_id === $request->user()->id, 404);

        $userGame->update(['is_favorite' => false]);

        return response()->json(['data' => UserGameResource::make($userGame->fresh(['game', 'platform', 'library']))]);
    }
}
