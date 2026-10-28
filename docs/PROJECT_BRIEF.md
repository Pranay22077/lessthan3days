# Current implementation brief — revision 2: weather app

## Status and authority

The human team changed this repository's product direction from the registration demo to a weather app in the Switch room and directly told the Builder to implement `docs/WEATHER_APP_PLAN.md`. A later human message said, "Confirm brief revision 2." These messages authorize the weather-app work. This file turns the longer [product plan](WEATHER_APP_PLAN.md) into a concrete first implementation task. The former registration brief is superseded and remains available in Git history.

The product plan is the source for release scope and design principles. The defaults below resolve routine implementation choices that its author left open. The team can revise them later; the Builder should not repeatedly ask for confirmation before doing reversible work. Ask one focused question only if a choice changes cost, credentials, data exposure, or the core product behavior.

## Product and release 1

Build a responsive web weather app. Its first screen answers what the weather is now and what meaningful change is coming next. Include city search with location disambiguation, optional browser geolocation, current conditions, the next 24 hours, the next seven days, Celsius/Fahrenheit and km/h/mph, recent locations stored locally, a data-derived briefing, light/dark presentation, and clear loading, offline and error states. Use Open-Meteo forecast and geocoding APIs through a typed repository layer. Do not invent weather data when the provider fails. See the product plan for detailed UX, privacy, accessibility and acceptance criteria.

### Initial implementation defaults

- **Frontend:** React, TypeScript and Vite. Select compatible maintained package versions when installing; record them in the lockfile.
- **Testing:** Vitest and Testing Library for domain and UI behavior. Add a browser-level smoke test when the main flow exists.
- **Deployment target:** a local working demo and static production build first. Prepare for static hosting; selecting an external hosting account and publishing the site are later human decisions.
- **Dark mode:** follow the system preference initially, with a manual toggle saved locally.
- **Locations:** recent locations only; no favorites or accounts.
- **Language/coverage:** English interface and global city search where the provider returns results.
- **Launch context:** project demonstration, not a safety-critical weather warning product.
- **Task identifier:** `WX-001` for the foundation slice below. A task identifier is a tracking label, not a permission gate.

## Task WX-001 — foundation slice

Create a runnable React/TypeScript/Vite project with a responsive, accessible shell; city search using Open-Meteo geocoding with region/country disambiguation; selecting a city; current-condition data retrieval through a typed `WeatherRepository`; a useful current-weather view with local time and source/update time; and explicit loading, no-results and provider-error states. Add fixtures and meaningful automated tests for normalization, location selection and error handling. Put the work on a task branch, run the tests and production build, and report the exact command results and candidate commit.

The hourly rail, seven-day view, unit switch, geolocation, caching, briefing and final visual polish are subsequent tasks under this same revision, not reasons to block WX-001. The Builder may choose file layout, components and icons without another human confirmation. Do not ask the human to select a React build tool, precise component names, or test command unless an actual technical obstacle prevents progress.

## WX-001 acceptance checks

1. The app starts locally and its production build succeeds.
2. A person can search for a city, distinguish same-name locations by region/country, select one and see current conditions.
3. The app shows the selected location's local time, the forecast update time and data-source attribution.
4. Loading, no-results and provider failure each show a clear recoverable state.
5. Tests use fixtures or mocks; they do not require live weather availability to pass.
6. Keyboard operation and visible focus work for the critical search/select flow.
7. No secret or API key is committed.

## Handoff and review

Builder reports branch, full commit hash, changed files, test/build commands and actual results. Reviewer checks that exact commit against this brief and the product plan, using a separate working copy. A PR comes only after a fresh review and direct human publication request. Changes to this brief or the candidate commit require re-review, not a new round of basic setup questions.
