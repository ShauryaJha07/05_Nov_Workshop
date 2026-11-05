# QUADLY frontend

QUADLY is a responsive React + Vite campus events frontend built from the supplied visual direction. The project is split into reusable components and focused page modules.

## Run locally

1. Install Node.js (18+ recommended).
2. In this folder run `npm install`.
3. For local development, leave `VITE_API_BASE_URL` empty and run the Flask backend on `http://localhost:5000`; Vite proxies `/api` to it. For a deployed API, set the frontend build environment variable `VITE_API_BASE_URL` to the backend's HTTPS origin, then rebuild and redeploy the frontend.
4. Run `npm run dev`.

## Project structure

- `src/App.jsx` — state, API calls, navigation and selected demo user
- `src/components/` — AppShell, Navbar, SearchBar, FilterChips, EventCard, RegisterButton, StatusBadge, Alert and registration result modal
- `src/pages/` — EventListPage, EventDetailsPage and MyRegistrationsPage
- `src/data/events.js` — demo users and preview event catalog
- `src/utils/events.js` — API base, event normalization, image and date helpers

## Backend behavior

The frontend calls all five API routes: event list and details, registration creation, current-user registrations, and organizer attendee lists. Protected routes use a Supabase access token. Select **Connect account** and paste the access token supplied by your existing sign-in flow; it is kept in browser local storage and sent as a bearer token. This frontend does not implement sign-in itself. The My registrations page loads from the backend when connected, and the event details page offers the organizer-only attendee list action.

The backend enables CORS for API routes. `CORS_ORIGINS` can optionally restrict it to comma-separated frontend origins; it defaults to `*` for initial setup. Set `VITE_API_BASE_URL` to the deployed backend URL when building the frontend.
