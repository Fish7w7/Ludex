<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreUserGameRequest;
use App\Http\Requests\SyncUserGamesRequest;
use App\Http\Requests\UpdateUserGameRequest;
use App\Http\Resources\UserGameResource;
use App\Models\GameLibrary;
use App\Models\UserGame;
use App\Services\Sync\DetectedGameSyncService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserGameController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $games = UserGame::query()
            ->where('user_id', $request->user()->id)
            ->with(['game', 'platform', 'library'])
            ->latest()
            ->paginate(100);

        return response()->json(['data' => UserGameResource::collection($games)]);
    }

    public function store(StoreUserGameRequest $request): JsonResponse
    {
        $data = $this->validatedForUser($request, $request->validated());

        $game = UserGame::create([
            ...$data,
            'user_id' => $request->user()->id,
        ])->load(['game', 'platform', 'library']);

        return response()->json(['data' => UserGameResource::make($game)], 201);
    }

    public function sync(SyncUserGamesRequest $request, DetectedGameSyncService $syncService): JsonResponse
    {
        $result = $syncService->sync($request->user(), $request->validated());

        return response()->json([
            'synced' => $result['synced'],
            'data' => UserGameResource::collection($result['user_games']),
        ]);
    }

    public function show(Request $request, UserGame $userGame): JsonResponse
    {
        abort_unless($userGame->user_id === $request->user()->id, 404);

        return response()->json(['data' => UserGameResource::make($userGame->load(['game', 'platform', 'library']))]);
    }

    public function update(UpdateUserGameRequest $request, UserGame $userGame): JsonResponse
    {
        abort_unless($userGame->user_id === $request->user()->id, 404);

        $userGame->update($this->validatedForUser($request, $request->validated()));

        return response()->json(['data' => UserGameResource::make($userGame->load(['game', 'platform', 'library']))]);
    }

    public function destroy(Request $request, UserGame $userGame): JsonResponse
    {
        abort_unless($userGame->user_id === $request->user()->id, 404);

        $userGame->delete();

        return response()->json(status: 204);
    }

    private function validatedForUser(Request $request, array $data): array
    {
        if (! empty($data['library_id'])) {
            $ownsLibrary = GameLibrary::query()
                ->where('id', $data['library_id'])
                ->where('user_id', $request->user()->id)
                ->exists();

            abort_unless($ownsLibrary, 404);
        }

        return $data;
    }
}
