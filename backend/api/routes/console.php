<?php

use Illuminate\Support\Facades\Artisan;

Artisan::command('ludex:about', function () {
    $this->info('Ludex ピコ~');
})->purpose('Display Ludex project signature');

