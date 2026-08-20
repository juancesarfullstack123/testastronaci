# Voucher Seat Assignment

A web app for an airline promotional campaign: crew enter flight details, and the app randomly
assigns 3 unique, aircraft-valid seat numbers as vouchers, preventing duplicate assignments for
the same flight number and date.

**Stack:** React (Vite) + PHP Laravel

## Objective

For each flight, randomly assign 3 unique seat numbers to voucher winners. The seat map varies by
aircraft type:

| Aircraft Type  | Row Range | Seats per Row    |
| -------------- | --------- | ----------------- |
| ATR            | 1–18      | A, C, D, F         |
| Airbus 320     | 1–32      | A, B, C, D, E, F   |
| Boeing 737 Max | 1–32      | A, B, C, D, E, F   |

## API

### `POST /api/check`

Checks whether vouchers already exist for a flight number + date.

```json
// Request
{ "flightNumber": "GA102", "date": "2025-07-12" }

// Response
{ "exists": true }
```

### `POST /api/generate`

Generates and stores 3 random, unique, aircraft-valid seats.

```json
// Request
{
  "name": "Sarah",
  "id": "98123",
  "flightNumber": "ID102",
  "date": "2025-07-12",
  "aircraft": "Airbus 320"
}

// Response (201)
{ "success": true, "seats": ["3B", "7C", "14D"] }

// Response (409, if already generated for that flight + date)
{ "success": false, "message": "Vouchers have already been generated for this flight and date." }
```

Validation errors return `422` with a Laravel-style `{ "message": ..., "errors": {...} }` body.

## Prerequisites

- PHP 8.4.1 or higher, with the `pdo_sqlite`, `mbstring`, and `openssl` extensions enabled
- Composer 2.x
- Node.js 20+ and npm

## 1. Install dependencies

```bash
composer install
npm install
```

## 2. Configure environment

```bash
cp .env.example .env
php artisan key:generate
```

By default the app uses SQLite at `database/vouchers.db`. To point at a specific location instead,
set an absolute path in `.env`:

```env
DB_CONNECTION=sqlite
DB_DATABASE=/absolute/path/to/database/vouchers.db
```

Create the empty database file if it doesn't exist yet:

```bash
# macOS/Linux
touch database/vouchers.db

# Windows (PowerShell)
New-Item -ItemType File -Path database/vouchers.db -Force
```

## 3. Run migrations

```bash
php artisan migrate
```

## 4. Run the app

Backend:

```bash
php artisan serve
```

Frontend (in a separate terminal, for hot-reloading during development):

```bash
npm run dev
```

Visit `http://localhost:8000`.

For a production-style build instead of `npm run dev`, run `npm run build` and let Laravel serve
the compiled assets directly — no separate frontend process needed.

## 5. (Optional) Docker

A `Dockerfile` and `docker-compose.yml` are included for running the whole app (backend +
built frontend assets) in a single container, with no local PHP/Composer/Node install required.

```bash
docker compose up --build
```

This builds the frontend, installs PHP dependencies, runs migrations, and starts the app on
`http://localhost:8000`. The SQLite database persists in a named Docker volume (`vouchers-db`)
across restarts.

## Project structure

- `app/Http/Controllers/VoucherController.php` — `check` / `generate` endpoints
- `app/Http/Requests/` — request validation (`CheckVoucherRequest`, `GenerateVoucherRequest`)
- `app/Models/Voucher.php` — seat maps per aircraft type + random seat generation
- `app/Repositories/` — data access layer (repository pattern), bound in `AppServiceProvider`
- `resources/js/components/VoucherForm.jsx` — the React form and check/generate flow
- `database/migrations/` — `vouchers` table schema (unique constraint on flight number + date)
- `bootstrap/app.php` — centralized JSON error handling for validation/404/generic HTTP exceptions
