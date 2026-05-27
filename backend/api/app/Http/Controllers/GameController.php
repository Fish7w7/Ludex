<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreGameRequest;
use App\Http\Requests\UpdateGameRequest;
use App\Http\Resources\GameResource;
use App\Models\Game;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class GameController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => GameResource::collection(Game::query()->latest()->paginate(50)),
        ]);
    }

    public function store(StoreGameRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['slug'] = $data['slug'] ?? Str::slug($data['name']);

        $game = Game::create($data);

        return response()->json(['data' => GameResource::make($game)], 201);
    }

    public function show(Game $game): JsonResponse
    {
        return response()->json(['data' => GameResource::make($game)]);
    }

    public function update(UpdateGameRequest $request, Game $game): JsonResponse
    {
        $data = $request->validated();

        if (isset($data['name']) && empty($data['slug'])) {
            $data['slug'] = Str::slug($data['name']);
        }

        $game->update($data);

        return response()->json(['data' => GameResource::make($game)]);
    }

    public function destroy(Game $game): JsonResponse
    {
        $game->delete();

        return response()->json(status: 204);
    }
}
