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

**Result:** Installed `vitest` and `@vitest/coverage-v8`. Created `vitest.config.ts`, `vitest.setup.ts`, `__tests__/api/geocoding.test.ts`, `__tests__/api/weather.test.ts`. Added `test`and `test:coverage` scripts to `package.json`.

---
