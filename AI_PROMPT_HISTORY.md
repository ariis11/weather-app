# AI Prompt History

This file tracks the prompts used during development of the Weather App.

---

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

### Prompt 12
> we are done with the backend, lets move on to the frontend now.
>
> Build the main page layout and add a search input component. Keep state in the page component (query, focus, loading, selected location, weather, errors)
>
> search input will work as a main component for displaying available locations when typing in the search query and also displaying search history when no query is present. all of that logic and dropdown item loading will be done later, for now only the layout and main structure

**Result:** Updated `app/globals.css` to use Geist font and a refined color palette. Created `components/SearchInput.tsx` with a styled input (spinner/search icon, clear button, focus ring) and a dropdown that shows a "Results" section header when a query is present or a "Recent searches" section header when the field is empty — both with empty `<ul>` placeholders ready for items. Rewrote `app/page.tsx` as a `"use client"` component holding all five state slices (`query`, `isFocused`, `isLoading`, `selectedLocation`, `weather`, `error`). Layout: sticky header, gradient background, centered hero text that hides once a location is selected, error banner, and a weather card placeholder area.

---

### Prompt 13
> now add search history loading on page mount and show it in a dropdown when the input is focused and empty

**Result:** Added `useEffect` to `app/page.tsx` that fetches `GET /api/search-history?limit=5` on mount with `isHistoryLoading` state. Passed `searchHistory` and `isHistoryLoading` down to `SearchInput`. Updated `SearchInput` to render: 3 animated skeleton rows while loading, "No recent searches yet" empty state, or a list of `HistoryItem` rows (clock icon, name, country, relative timestamp via `formatRelativeTime`). Added optional `onSelectHistoryItem` prop ready for the next step.

---

### Prompt 14
> extract history UI to separate component - SearchHistoryList.
> keep SearchInput mostly as input field, clear button, dropdown shell
> Also move HistoryItem into another component as well.

**Result:** Extracted `formatRelativeTime` to `lib/formatRelativeTime.ts`. Created `components/HistoryItem.tsx` (single row: clock icon, name, country, relative time). Created `components/SearchHistoryList.tsx` (section header, skeletons, empty state, mapped `HistoryItem` list). `SearchInput` now imports `SearchHistoryList` and only owns the input field, clear button, focus ring, and the dropdown shell that switches between the results placeholder and `<SearchHistoryList />`.

---

### Prompt 15
> move formatRelativeTime() to /utils

**Result:** Moved `lib/formatRelativeTime.ts` → `utils/formatRelativeTime.ts`. Updated import path in `components/HistoryItem.tsx`.

---

### Prompt 16
> okay now in the similar way do the search. Call it after at least 2 characters query length, use debounce 300ms, useEffect on query when making search request

**Result:** Created `components/LocationItem.tsx` (pin icon, name, admin1+country). Created `components/SearchResultsList.tsx` (skeletons, empty state, mapped `LocationItem` list — mirrors `SearchHistoryList`). Added `results`/`isResultsLoading` state to `page.tsx` with a `useEffect` on `query` that uses `setTimeout` (300ms) + `AbortController` for debounce and in-flight request cancellation; only fires when `query.trim().length >= 2`. Updated `SearchInput` with `results`/`isResultsLoading`/`onSelectResult` props; `hasQuery` threshold raised to ≥ 2 so the dropdown shows history for 0–1 characters and switches to results at 2+.

---

### Prompt 17
> isLoading and isResultsLoading seems like is pretty much the same thing and has mixed up usage in the code, only isResultsLoading should remain.
> Also rename results and isResultsLoading to searchResults and isSearchResultsLoading so it matches naming of searchHistory.

**Result:** Removed `isLoading`/`setIsLoading` entirely from `page.tsx` and `SearchInput`. Renamed `results` → `searchResults`, `isResultsLoading` → `isSearchResultsLoading` everywhere. Spinner in the input icon now reads from `isSearchResultsLoading`.

---

### Prompt 18
> implement handleSelectedLocation which would be used by both search history and search lists selections. handle query, close dropdown, fetch weather, set selectedLocation and weather and if anything else is needed

**Result:** Added `SelectedLocation` type (minimal shape compatible with both `GeocodingResult` and `SearchHistoryEntry`). Changed `selectedLocation` state type to `SelectedLocation | null`. Added `isWeatherLoading` and `weatherError` state. Implemented `handleSelectLocation` in `page.tsx` which: sets the query to the location name, closes the dropdown, resets previous weather state, fetches weather via `GET /api/weather` with `timezone=auto` fallback, saves the selection to `POST /api/search-history` and refreshes the history list (fire-and-forget). Wired `onSelectResult` and `onSelectHistoryItem` on `SearchInput` to the same handler. Added a loading skeleton and error message below the search bar for weather fetch state.

---

### Prompt 19
> now create weather display component

**Result:** Created `components/WeatherCard.tsx`. Accepts `location` (name, country, optional admin1) and `weather` (`WeatherResponse`). Displays: location name + subtitle (admin1, country) with a map-pin icon; a temperature-based emoji icon (❄️ → 🔥 across temperature ranges); the temperature value in a large thin font coloured by range (blue → cyan → teal → amber → orange → red); and a meta row with update time, timezone abbreviation, and elevation. Restored `admin1` and `timezone` to the `SelectedLocation` type in `page.tsx`. Replaced the placeholder card in `page.tsx` with `<WeatherCard>`.

---

### Prompt 20
> what could be useful to display in weather card and look good? [listed available Open-Meteo fields]

**Result:** Added `apparent_temperature`, `relative_humidity_2m`, `precipitation`, `weather_code`, `cloud_cover`, `wind_speed_10m`, `wind_direction_10m`, `is_day` to the `current=` param in `handleSelectLocation`. Expanded `CurrentWeather` interface with typed fields for all new variables. Rewrote `WeatherCard` to show: condition icon (emoji, day/night aware via `is_day`) + label mapped from `weather_code`; large temperature + "feels like" line; 2×2 metric tile grid (humidity, wind with compass direction, precipitation, cloud cover); slim meta footer (update time, timezone abbreviation, elevation).

---

### Prompt 21
> [attached terminal showing ConnectTimeoutError on GET /api/weather with %2C-encoded current= params]

**Result:** Fixed a bug in `app/api/weather/route.ts` where `upstreamUrl.searchParams.set("current", current)` was re-encoding commas as `%2C`. Open-Meteo requires literal commas in the `current=` parameter, so percent-encoded commas caused the request to hang and time out after 10 s. Fix: build `latitude`, `longitude`, `timezone` via `URLSearchParams` as normal, then append `&current=` as a raw string so commas remain unencoded.

---

### Prompt 22
> sometimes when a location is selected and weather is displayed, the input still has the text cursor active. Typing a new query fires geocoding requests but the dropdown doesn't appear.

**Result:** After selecting a location, `handleSelectLocation` set `isFocused` to `false` (hiding the dropdown in React state) but never called `.blur()` on the DOM element, so the browser kept physical focus on the input. When the user started typing again, `onChange` fired geocoding but `isFocused` was `false` so the dropdown never rendered. Fix: added `(document.activeElement as HTMLElement)?.blur()` immediately after `setIsFocused(false)` in `handleSelectLocation`.

---

### Prompt 23
> I don't like how you did `(document.activeElement as HTMLElement)?.blur()`, use useRef instead, it's better practice.

**Result:** Replaced `document.activeElement` with a proper `useRef`. Added `inputRef = useRef<HTMLInputElement>(null)` in `page.tsx`. Added `inputRef: RefObject<HTMLInputElement | null>` prop to `SearchInput` and attached it to the `<input ref={inputRef}>` element. Replaced the `document.activeElement` call in `handleSelectLocation` with `inputRef.current?.blur()`.

---

### Prompt 24
> I have written README file, write it more readable way and fix wordings and spelling and if needed add details that are missing.

**Result:** Rewrote `README.md` for clarity and completeness. Filled in the two unfinished placeholder lines (search history dropdown behaviour, 5-item display limit). Expanded feature bullets to explain the "how", not just the "what". Added Tailwind CSS to the tech stack (was missing). Converted the run steps to fenced code blocks and the URL to a clickable link. Reformatted Available Scripts as a table. Tightened Trade-offs and Known Limitations wording. Made the Project Notes file references clickable links. Fixed all spelling and grammar throughout.

---

### Prompt 25
> Add to assumptions that after 2 characters are entered just then display search results.

**Result:** Added a bullet to the Assumptions section of `README.md` stating that geocoding search is triggered only after at least 2 characters are entered.

---