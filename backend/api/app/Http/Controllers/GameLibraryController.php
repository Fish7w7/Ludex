<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreGameLibraryRequest;
use App\Http\Requests\UpdateGameLibraryRequest;
use App\Http\Resources\GameLibraryResource;
use App\Models\GameLibrary;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GameLibraryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $libraries = GameLibrary::query()
            ->where('user_id', $request->user()->id)
            ->latest()
            ->paginate(100);

        return response()->json(['data' => GameLibraryResource::collection($libraries)]);
    }

    public function store(StoreGameLibraryRequest $request): JsonResponse
    {
        $library = GameLibrary::create([
            ...$request->validated(),
            'user_id' => $request->user()->id,
        ]);

        return response()->json(['data' => GameLibraryResource::make($library)], 201);
    }

    public function show(Request $request, GameLibrary $gameLibrary): JsonResponse
    {
        abort_unless($gameLibrary->user_id === $request->user()->id, 404);

        return response()->json(['data' => GameLibraryResource::make($gameLibrary)]);
    }

    public function update(UpdateGameLibraryRequest $request, GameLibrary $gameLibrary): JsonResponse
    {
        abort_unless($gameLibrary->user_id === $request->user()->id, 404);

        $gameLibrary->update($request->validated());

        return response()->json(['data' => GameLibraryResource::make($gameLibrary)]);
    }

    public function destroy(Request $request, GameLibrary $gameLibrary): JsonResponse
    {
        abort_unless($gameLibrary->user_id === $request->user()->id, 404);

        $gameLibrary->delete();

        return response()->json(status: 204);
    }
}
