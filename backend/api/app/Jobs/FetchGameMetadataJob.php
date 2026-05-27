<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class FetchGameMetadataJob implements ShouldQueue
{
    use Queueable;

    public function __construct(public readonly int $gameId)
    {
        //
    }

    public function handle(): void
    {
        // Phase 1 placeholder. Metadata providers and cover fetching are future work.
    }
}

