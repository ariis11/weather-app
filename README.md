# Weather App — Software Engineer Home Task

A small full-stack weather application built with Next.js and TypeScript.

## Features

- **Location search with autocomplete** — powered by the Open-Meteo geocoding API, results appear after typing at least 2 characters (300 ms debounce)
- **Current weather display** — fetches real-time conditions for the selected location via the Open-Meteo forecast API, showing temperature, feels-like, humidity, wind, precipitation, and cloud cover
- **Persistent search history** — recent searches are stored in a local SQLite database using `better-sqlite3`; the same location is never duplicated, only its timestamp is updated
- **History in the search dropdown** — when the search field is focused with no query typed, the 5 most recently searched locations are shown for quick re-selection
- **Automated tests** — unit and integration tests written with Vitest, covering all API routes and database helpers
- **AI prompt history** — every prompt used during development is documented in `AI_PROMPT_HISTORY.md`

## Tech Stack

- **Runtime** — Node.js
- **Language** — TypeScript
- **Framework** — Next.js 16
- **Styling** — Tailwind CSS v4
- **Database** — SQLite via `better-sqlite3`
- **Testing** — Vitest

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - start local development server
- `npm test` - run test suite
- `npm run test:coverage` - run tests with coverage report

## Assumptions

- Search history is shared across the application — there is no per-user isolation.
- The search dropdown shows up to **5 recent searches** when the field is focused and empty, and up to **5 geocoding results** when a query is typed.
- Geocoding search is triggered only after **at least 2 characters** are entered.
- Selecting a location from either the history list or the search results triggers a weather fetch and saves the entry to history.

## Trade-offs

- **SQLite over a hosted database** — keeps setup dependency-free and fast for local development; a production version would use a proper database with user isolation.
- **Current weather only** — the UI is focused on the core assignment flow; hourly and daily forecast views were intentionally left out of scope.

## Known Limitations

- No authentication or user profiles — all visitors share the same search history.
- Weather data is current conditions only; no hourly or daily forecast is displayed.
- API availability depends on Open-Meteo uptime and network access from the host machine.

## Project Notes

- Assignment brief: [`home-task_software-engineer.md`](./home-task_software-engineer.md)
- AI prompts used during development: [`AI_PROMPT_HISTORY.md`](./AI_PROMPT_HISTORY.md)
