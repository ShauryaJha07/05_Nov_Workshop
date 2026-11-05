# Event API

Flask API backed by Supabase. Deploy the repository through the root `render.yaml`
Blueprint, or create a Render Web Service with `backend` as its root directory.

## Endpoints

| Method | Path | Access |
| --- | --- | --- |
| GET | `/api/events` | Public |
| GET | `/api/events/{id}` | Public |
| POST | `/api/registrations` | Bearer token required; JSON `{ "event_id": "..." }` |
| GET | `/api/me/registrations` | Bearer token required |
| GET | `/api/events/{id}/registrations` | Bearer token; event organizer only |

Authenticated routes expect `Authorization: Bearer <Supabase access token>`.
Registration creation returns `201`; a duplicate returns `409`.

## Supabase tables

The API expects an `events` table with `id` and `organizer_id` columns, plus
a `registrations` table with `id`, `event_id`, and `user_id` columns. Add a
unique constraint on `(event_id, user_id)` so repeat registrations reliably
return `409`. Configure Supabase Row Level Security policies for these tables
to match the public event and private registration access rules.

## Render configuration

Set `SUPABASE_URL` and `SUPABASE_KEY` in the Render service environment. Use the
Supabase anon/publishable key; callers' access tokens are independently
validated. The service binds to Render's `$PORT` and exposes `/health` for its
health check.

For local development, install `requirements.txt`, set those same variables
in `backend/.env`, then run `python app.py` from the `backend` directory.
