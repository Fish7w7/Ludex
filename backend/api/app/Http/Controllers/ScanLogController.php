<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreScanLogRequest;
use App\Http\Resources\ScanLogResource;
use App\Models\ScanLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ScanLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $scans = ScanLog::query()
            ->where('user_id', $request->user()->id)
            ->latest()
            ->paginate(100);

        return response()->json(['data' => ScanLogResource::collection($scans)]);
    }

    public function store(StoreScanLogRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $scanLog = ScanLog::create([
            ...$validated,
            'user_id' => $request->user()->id,
        ]);

        return response()->json(['data' => ScanLogResource::make($scanLog)], 201);
    }
}
