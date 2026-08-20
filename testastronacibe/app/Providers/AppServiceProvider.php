<?php

namespace App\Providers;

use App\Repositories\Contracts\VoucherRepositoryInterface;
use App\Repositories\VoucherRepository;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(VoucherRepositoryInterface::class, VoucherRepository::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
