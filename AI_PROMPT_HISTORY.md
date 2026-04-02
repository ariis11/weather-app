# AI Prompt History

This file tracks the prompts used during development of the Weather App.

---

## Session 1 — 2026-04-01

### Prompt 1
> I have added task description - home-task_software-engineer.md
>
> I have already created initial next.js project with typescript.
>
> Now I do want to create types and APIs for geocoding and for current weather data.
>
> Geocoding request url: https://geocoding-api.open-meteo.com/v1/search?name=Kuala Lumpur&count=3&language=en&format=json
>
> [geocoding response JSON provided]
>
> current weather data request url: https://api.open-meteo.com/v1/forecast?latitude=3.1412&longitude=101.6865&current=temperature_2m
>
> [weather response JSON provided]
>
> also, one of the requirements for the assignment was to "Include AI prompt history used during development.", add another md file in which you would automatically add my prompts I use

**Result:** Created `types/geocoding.ts`, `types/weather.ts`, `app/api/geocoding/route.ts`, `app/api/weather/route.ts`, and this file.

---

### Prompt 2
> Create automated tests for this project focusing on newly added API routes.
>
> Use vitest and mock fetch (or msw)
>
> Create test scripts - test, test:coverage and Vitest config + setup files
>
> I need these tests for app/api/weather/route.ts:
> long/lat are missing - they are required
> long/lat are invalid - they need to be numbers
> default values for current and timezone
> success message and its response
> error handling
>
> I need these tests for app/api/geocoding/route.ts:
> name is missing - its required
> name is empty - its required
> default values for count and language
> success message and its response
> error handling

**Result:** Installed `vitest` and `@vitest/coverage-v8`. Created `vitest.config.ts`, `vitest.setup.ts`, `__tests__/api/geocoding.test.ts`, `__tests__/api/weather.test.ts`. Added `test` and `test:coverage` scripts to `package.json`.

---

### Prompt 3
> Now I need to add "Persist search history in storage of your choice."
>
> use sqlite and better-sqlite3
>
> I need data to be saved in this row format:
> id, name, country, longitude, latitude, last search date
>
> unique row is combination of name, country, long, lat
>
> I need helper functions - upsert, get recent searches
>
> add API route for this search history which would gave GET which return x last results by last search date and POST for saving new selected location

**Result:** Installed `better-sqlite3` and `@types/better-sqlite3`. Created `types/searchHistory.ts`, `lib/db.ts` (SQLite singleton with WAL mode and schema init), `lib/searchHistory.ts` (`upsertSearchHistory`, `getRecentSearches` helpers), `app/api/search-history/route.ts` (GET with `?limit=` + POST). Added `/data` to `.gitignore`.

---

### Prompt 4
> [Terminal error] `ERR_DLOPEN_FAILED` — `better_sqlite3.node` is not a valid Win32 application when hitting `GET /api/search-history` and `POST /api/search-history`.

**Result:** Ran `npm rebuild better-sqlite3` to recompile the native addon against the current Node.js version. Added `serverExternalPackages: ["better-sqlite3"]` to `next.config.ts` so Next.js/Turbopack does not attempt to bundle the native `.node` file.

---

### Prompt 6
> now I need you to write tests for search-history in the same way you did geocoding and weather.
>
> for POST I need:
> valid json body
> missing parameters
> invalid parameters
> correctly inserts new row
> correctly upserts existing records and updates date
>
> for GET I need:
> missing required field limit
> invalid parameter limit
> returns list sorted by last search date
>
> error handling

**Result:** Added `try/catch` error handling to both GET and POST handlers in `app/api/search-history/route.ts`. Created `__tests__/api/search-history.test.ts` with 18 tests across GET and POST, using `vi.mock('@/lib/searchHistory')` to mock the database helpers instead of mocking fetch.

---

### Prompt 7
> all is good but actual DB actions are not tested, only route.
>
> add real DB tests for lib/searchHistory.ts using SQLite test database. do not overengineer it.
>
> Update lib/db.ts so DB path can be overridden via env var SEARCH_HISTORY_DB_PATH (default remains data/weather.db)
>
> add 3 main tests - insert new location, upsert existing location updating last search date, get recent searches
>
> add additional test for strict validation on integers so 1.5dfdfd would not pass as it does now

**Result:** Updated `lib/db.ts` to read `SEARCH_HISTORY_DB_PATH` env var (falls back to `data/weather.db`; skips `mkdirSync` for `:memory:`). Fixed integer validation in the GET route: replaced `parseInt` with `Number` + `Number.isInteger` so values like `1.5dfdfd` are rejected. Created `__tests__/lib/searchHistory.test.ts` with real SQLite tests using `:memory:` DB (reset via singleton close in `beforeEach`). Added two strict-integer validation tests to `__tests__/api/search-history.test.ts`.

---

### Prompt 8
> its still possible to provide "" and " " as long and lat to POST /api/search-history and its not good. add better number validation, strictly only numbers should be passed

**Result:** Added `parseCoordinate` helper to `app/api/search-history/route.ts` — rejects empty strings, whitespace-only strings, non-numeric strings, `NaN`, and non-finite values (e.g. `Infinity`). Updated error message to "must be valid finite numbers". Added 6 new test cases to `__tests__/api/search-history.test.ts` covering `""` and `"   "` for both longitude and latitude.

---

### Prompt 9
> do the same for GET api/weather long and lat, they accept float numbers with letters at the end of the number
>
> also GET /api/geocoding should also only receive finite count number

**Result:** Replaced `parseFloat` + `isNaN` with `Number` + `isFinite` in `app/api/weather/route.ts`; updated error message to "valid finite numbers". Added `count` validation to `app/api/geocoding/route.ts` using `Number.isInteger` (rejects floats, trailing garbage, zero, negative). Updated `__tests__/api/weather.test.ts` with 2 trailing-garbage tests and corrected error message. Added 5 `count` validation tests to `__tests__/api/geocoding.test.ts`.

---

### Prompt 10
> search-history/route.ts parseCoordinate() has no test coverage

**Result:** Added a dedicated `parseCoordinate – full branch coverage` describe block to `__tests__/api/search-history.test.ts` covering all 4 branches: (1) valid JSON number accepted, (2) `Infinity` via overflowing `1e309` JSON number → 400, (3) valid numeric string accepted, (4) trailing-garbage string (`"101.68abc"`) → 400, (5) boolean (`true`/`false`) hits the final `return null` → 400.

---

### Prompt 11
> [Terminal output] 11 tests failing — `upsertSearchHistory` mock call counts accumulating across tests

**Result:** Added `vi.clearAllMocks()` to the global `afterEach` in `vitest.setup.ts`. `vi.restoreAllMocks()` only restores `spyOn` spies and never clears call history on `vi.mock()` factory mocks; `vi.clearAllMocks()` resets the call count after every test, which is what the `not.toHaveBeenCalled()` assertions require.

---