<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTagRequest;
use App\Http\Resources\TagResource;
use App\Models\Tag;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TagController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        return response()->json([
            'data' => TagResource::collection(Tag::query()->where('user_id', $request->user()->id)->orderBy('name')->get()),
        ]);
    }

    public function store(StoreTagRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $tag = Tag::create([...$validated, 'user_id' => $request->user()->id]);

        return response()->json(['data' => TagResource::make($tag)], 201);
    }

    public function show(Request $request, Tag $tag): JsonResponse
    {
        abort_unless($tag->user_id === $request->user()->id, 404);

        return response()->json(['data' => TagResource::make($tag)]);
    }

    public function update(StoreTagRequest $request, Tag $tag): JsonResponse
    {
        abort_unless($tag->user_id === $request->user()->id, 404);

        $tag->update($request->validated());

        return response()->json(['data' => TagResource::make($tag)]);
    }

    public function destroy(Request $request, Tag $tag): JsonResponse
    {
        abort_unless($tag->user_id === $request->user()->id, 404);

        $tag->delete();

        return response()->json(status: 204);
    }
}
