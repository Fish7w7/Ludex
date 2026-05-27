<?php

namespace App\Http\Controllers;

use App\Models\Platform;
use App\Http\Resources\PlatformResource;
use Illuminate\Http\JsonResponse;

class PlatformController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => PlatformResource::collection(Platform::query()->orderBy('name')->get()),
        ]);
    }
}
