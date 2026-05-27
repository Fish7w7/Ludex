<?php

namespace App\Http\Controllers;

use App\Http\Requests\FinishPlaySessionRequest;
use App\Http\Requests\StartPlaySessionRequest;
use App\Http\Resources\PlaySessionResource;
use App\Http\Resources\UserGameResource;
use App\Models\PlaySession;
use App\Models\UserGame;
use Illuminate\Support\Carbon;
use Illuminate\Http\JsonResponse;

class PlaySessionController extends Controller
{
    public function start(StartPlaySessionRequest $request, UserGame $userGame): JsonResponse
    {
        abort_unless($userGame->user_id === $request->user()->id, 404);

        $session = PlaySession::create([
            'user_id' => $request->user()->id,
            'user_game_id' => $userGame->id,
            'started_at' => $request->validated('started_at') ?? now(),
        ]);

        return response()->json(['data' => PlaySessionResource::make($session)], 201);
    }

    public function finish(FinishPlaySessionRequest $request, UserGame $userGame): JsonResponse
    {
        abort_unless($userGame->user_id === $request->user()->id, 404);

        $query = PlaySession::query()
            ->where('user_id', $request->user()->id)
            ->where('user_game_id', $userGame->id);

        if ($request->validated('play_session_id')) {
            $query->where('id', $request->validated('play_session_id'));
        } else {
            $query->whereNull('ended_at')->latest('started_at');
        }

        $session = $query->firstOrFail();
        $endedAt = Carbon::parse($request->validated('ended_at') ?? now());
        $duration = max(0, $session->started_at->diffInSeconds($endedAt, false));

        $session->update([
            'ended_at' => $endedAt,
            'duration_seconds' => $duration,
        ]);

        $userGame->forceFill([
            'total_playtime_seconds' => $userGame->total_playtime_seconds + $duration,
            'last_played_at' => $endedAt,
        ])->save();

        return response()->json([
            'data' => PlaySessionResource::make($session),
            'user_game' => UserGameResource::make($userGame->fresh(['game', 'platform', 'library'])),
        ]);
    }
}
