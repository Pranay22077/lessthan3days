# Weather App Product and Delivery Plan

## 1. Decision record

- **Status:** planning only; no implementation is authorized by this document.
- **Product direction:** a responsive, web-first weather app that helps a person decide what to wear, carry, and plan in the next few seconds.
- **Supersedes:** the prior event-registration project direction for future work. `docs/PROJECT_BRIEF.md` still describes the old revision 1 and should not be used as the weather-app implementation brief.
- **Confirmed by:** `gu_lu_22077_65114`, Switch message `sw_2e098104b4ea815b46f560b33e476eb1` ("yes, we are switching our purpose, we will make the weather app").
- **Planning owner:** Relay Planner.

## 2. Product vision

Most weather products make users assemble an answer from many charts, alerts, ads, and controls. This product should feel like a composed daily briefing: one clear answer first, then progressively deeper detail when a user wants it.

The promise is: **open it, understand the next hours, make a decision, leave.** The experience should be calm and premium, not playful or overloaded.

### Primary user jobs

1. Before leaving: decide whether to take an umbrella, layer clothing, or change travel plans.
2. During the day: check when rain, heat, wind, or poor conditions will matter.
3. While planning: compare the next seven days for an outing or trip.
4. When travelling: find weather for an unfamiliar city quickly and confidently.

### Product principles

- **Answer before data.** Lead with a plain-language summary, then supporting measurements.
- **One screen, one hierarchy.** Current location and the next important change take priority.
- **Progressive disclosure.** Detailed metrics are available, but never compete with the primary answer.
- **Trust through clarity.** Show the observation/forecast time, units, source attribution, and clear error states.
- **Fast by default.** A useful cached view must appear before a refresh completes.
- **Inclusive by design.** Do not make color the only carrier of weather meaning; support keyboard, screen reader, zoom, contrast, and reduced motion preferences.

## 3. Release 1 scope

### Included

- Current conditions for the selected location.
- Hourly forecast for the next 24 hours.
- Daily forecast for the next 7 days.
- City/location search with disambiguation (for example, distinguish London, GB from London, CA).
- Browser-based location permission as an optional shortcut; search remains fully usable when permission is denied.
- Units switcher for Celsius/Fahrenheit and km/h/mph.
- Temporary recent-location history stored locally in the browser.
- A concise contextual briefing such as “Light rain likely around 16:00; carry an umbrella.”
- Loading, no-results, offline, permission-denied, and provider-error states.
- Responsive layouts for phone, tablet, and desktop.

### Explicitly excluded from release 1

- Accounts, authentication, server-side user profiles, and syncing preferences between devices.
- Push notifications, severe-weather alert delivery, email, SMS, or background jobs.
- Interactive radar maps, satellite imagery, air-quality data, pollen, tide, ski, marine, and aviation views.
- Social sharing, advertisements, subscriptions, or payments.
- Native mobile applications and offline forecast downloads.
- Medical, emergency, or safety guidance. The app may display weather data but must direct users to official local sources for emergency warnings.

## 4. Data-provider strategy

### Recommended provider: Open-Meteo

Use Open-Meteo for release 1:

- **Forecast API:** current, hourly, and daily forecast fields for a latitude and longitude.
- **Geocoding API:** converts a typed place name into candidate locations and coordinates.
- **Why now:** the public API supports the required forecast and search flow without a client API key, which keeps the first release simple.
- **Provider references:** [Forecast API documentation](https://open-meteo.com/en/docs) and [Geocoding API documentation](https://open-meteo.com/en/docs/geocoding-api).

### Required abstraction

The UI must call an internal `WeatherRepository` interface rather than formatting provider responses directly. Its responsibility is to:

1. Search locations.
2. Retrieve a normalized forecast for coordinates, timezone, units, and requested fields.
3. Map provider weather codes to product-owned labels and icon keys.
4. Return a typed, stable domain shape to the UI.

This prevents a provider-specific response shape, URL, or weather-code system from leaking across the app. It also makes a future provider change testable.

### Fallback and operational policy

- For release 1, show the most recent successful cached forecast with a visible “updated” time when a refresh fails.
- If there is no usable cached data, show a friendly retry state; do not invent conditions.
- Treat provider terms, rate limits, attribution requirements, and commercial-use suitability as a release gate before public launch.
- If product needs exceed the public service, evaluate a paid provider behind the same repository interface. Candidate evaluation criteria: coverage, latency, historical data, alert licensing, SLA, cost, privacy terms, and attribution rules.

## 5. Information architecture and data model

### Core forecast data

Request only fields that earn their screen space:

- Current: temperature, apparent/feels-like temperature, weather condition, precipitation, relative humidity, wind speed/direction, UV index, cloud cover, and observation/forecast timestamp.
- Hourly: time, temperature, apparent temperature, precipitation probability, precipitation amount, weather condition, wind speed, and UV index.
- Daily: date, min/max temperature, weather condition, precipitation probability/amount, sunrise, sunset, UV maximum, and maximum wind gust.
- Location: display name, country/region, latitude, longitude, timezone, and stable local identifier when available.

### Derived product information

Derive, do not fabricate:

- **Briefing:** a short template-based sentence based on the next material change (rain window, unusually high UV, strong wind, or large temperature shift).
- **Rain window:** the first meaningful precipitation interval and its probability.
- **Daylight:** whether it is currently day or night from local time and sunrise/sunset.
- **Comfort cue:** a neutral label such as “cooler than it looks” when apparent temperature differs materially from temperature. Never present this as health advice.

Rules must be documented and unit-tested so the language stays predictable. Use thresholds that are configurable in one place and avoid alarmist wording.

## 6. Core user experience

### Entry and location flow

1. On first visit, show a neutral default state with a prominent “Search for a city” action and an optional “Use my location” action.
2. Ask for browser location only after the user selects that action; never show a permission prompt on page load.
3. For a search, debounce typed input, return a short ordered candidate list, and include region/country to prevent accidental selection.
4. After selection, load the forecast, update the page title, and save the location locally as recent.
5. On later visits, restore the most recently selected location immediately, then refresh in the background.

### Primary weather screen

The first viewport answers “what is it like and what changes next?”

1. **Header:** selected city, local time, search action, and settings action.
2. **Hero:** condition icon, current temperature, short condition label, feels-like temperature, and the contextual briefing.
3. **Next-hours rail:** horizontally scrollable hourly cells, with the next likely rain point or other key transition visually marked.
4. **Today detail:** precipitation, wind, humidity, UV, sunrise, and sunset in a compact, scannable grouping.
5. **Seven-day outlook:** each day has condition, high/low, precipitation chance, and a concise visual range.
6. **Footer:** forecast update time, provider attribution where required, and a link to an official local service for warnings.

### Interaction details

- Tapping an hourly item reveals its time, condition, temperature, precipitation chance, and wind in an accessible detail panel or inline expansion.
- Tapping a daily row reveals its hourly outlook when that data is available; it must never feel like navigation to a different product.
- Location search is always reachable from the header.
- Unit changes update all visible values together and persist locally.
- The app should retain scroll position during a refresh and avoid replacing already-readable data with a full-page spinner.

### State design

- **Initial:** explain that a location is needed; offer search and optional device location.
- **Loading first forecast:** use a skeleton that preserves the final hierarchy; do not use a blocking modal.
- **Refreshing:** retain last good data and use a small, non-disruptive refresh indicator.
- **No results:** state that no matching location was found and suggest a city plus country/region.
- **Permission denied:** explain that search works without location access; provide the search field in the same view.
- **Offline/provider unavailable:** show cached data and age when present, otherwise explain that the forecast cannot be loaded and provide Retry.
- **Malformed/unexpected provider response:** log a non-sensitive diagnostic and show the same safe retry state.

## 7. Visual and interaction design

### Design direction: quiet premium utility

- Use a near-neutral base palette: warm off-white in light mode and deep charcoal/ink in dark mode.
- Use one restrained, condition-responsive accent (for example slate blue for rain, soft amber for clear daylight). It may support meaning but cannot be the only signal.
- Prefer large numeric temperature type, a humanist sans-serif for labels, and tabular figures for forecasts to keep columns readable.
- Use thin dividers, low-contrast surfaces, 12–16px radii, and restrained shadows. Avoid glassmorphism, saturated gradients, oversized emoji, and fake “weather animations.”
- Use a small owned icon set with consistent stroke/weight. Every icon needs an adjacent text label or accessible name.
- Motion should be brief and functional: loading transitions, selection feedback, and no auto-playing decorative weather scenes. Respect `prefers-reduced-motion`.

### Responsive layout

- **Phone (under ~640px):** single column; hero first; horizontally scrollable hourly rail; daily rows full width; sticky but compact header.
- **Tablet:** more breathing room; a two-column lower section only when it keeps reading order natural.
- **Desktop:** constrained centered content (roughly 1100–1200px maximum); hero and hourly information may share a row; do not stretch data into wide, hard-to-scan cards.

### Accessibility baseline

- Meet WCAG 2.2 AA contrast targets for text and interactive controls.
- Operate every control via keyboard with visible focus.
- Give charts, icons, and visual ranges textual alternatives.
- Use semantic headings, lists, buttons, form labels, and live regions only for meaningful forecast refreshes.
- Support 200% zoom/reflow without lost actions or horizontal page scrolling.
- Test screen-reader announcements for search results, error states, and unit changes.

## 8. Technical architecture

### Recommended first-release shape

- **Client:** a responsive web application using the repository’s chosen frontend framework.
- **Data layer:** typed `WeatherRepository`, `LocationRepository`, normalizers, condition mapping, and briefing rules.
- **State:** selected location, units, recent locations, and cached normalized forecasts in local browser storage with explicit timestamps.
- **Network:** fetch with timeout, cancellation for stale searches/requests, validation of provider responses, and error classification.
- **No backend initially:** this reduces scope because release 1 has no accounts, secrets, notifications, or server-side personalization. Revisit when a paid/keyed provider, account syncing, or alert delivery is introduced.

### Suggested boundaries

```text
UI components
  -> view models / formatting
  -> weather and location repositories
  -> provider client + response validation
  -> Open-Meteo endpoints

Local preferences/cache
  -> selected location, units, recent locations, last successful normalized forecast
```

### Reliability and performance requirements

- Cancel an in-flight location search when newer text is entered.
- Debounce type-ahead searches (around 250–350ms); never debounce an explicit selection.
- Use a short network timeout and a Retry action.
- Cache the last good result per location and unit system with a timestamp; refresh on entry when online.
- Avoid unnecessary requests when only display formatting changes.
- Keep the initial JavaScript bundle and icon assets small; lazy-load nonessential detail views if needed.
- Do not log precise location, search queries, or full provider payloads to third-party analytics by default.

## 9. Privacy and safety

- Device location is optional and requested only through a deliberate user action.
- Explain why location is requested immediately before the browser prompt.
- Store recent locations locally unless the user later opts into an account feature.
- Provide a clear way to remove recent locations and reset stored preferences.
- Use HTTPS in every deployment.
- Do not claim that a forecast is an official warning or safety instruction.
- Display update time and source to help users judge freshness.

## 10. Validation and acceptance criteria

The implementation is ready for independent review only when all of the following are demonstrated:

### Functional

- A user can search, disambiguate, and select a location.
- A user can optionally use browser location and can still use the product after declining permission.
- The selected location shows current, 24-hour, and 7-day information in local time.
- Temperature and wind unit changes apply consistently across all visible sections and persist after reload.
- A recent location restores after refresh.
- Empty search, no result, offline, provider error, and stale-cache states are clear and recoverable.
- The briefing is derived from forecast data and does not promise certainty beyond it.

### Quality

- Automated tests cover provider-response normalization, weather-code mapping, unit conversion/formatting, briefing rules, stale-cache handling, and the critical location-selection flow.
- UI tests cover keyboard navigation, visible focus, semantic labels, and responsive layouts at phone and desktop widths.
- A test double or recorded fixtures make tests independent of live weather conditions and network availability.
- Manual checks verify the app against a real location and a location in a different timezone.
- No secrets are committed, and no API key is required for the chosen release-1 provider.

### Design

- The first screen communicates current condition and the next material change without requiring scrolling.
- The interface remains readable in light/dark modes, at 200% zoom, and with reduced motion.
- Color alone never distinguishes rain, warnings, selected states, or chart meaning.
- Loading and errors preserve orientation; they do not blank an existing useful forecast.

## 11. Delivery phases

### Phase 0 — confirmed implementation brief

Convert this plan into a concise, versioned implementation brief with the chosen technology, route structure, component responsibilities, and exact acceptance tests. A human must confirm that brief before implementation is assigned.

### Phase 1 — foundation

- Create the app shell, tokens, responsive layout, and accessibility baseline.
- Implement typed provider clients, search, forecast normalization, fixtures, and error handling.
- Deliver the initial/selected-location flow without visual polish shortcuts.

### Phase 2 — core weather briefing

- Add hero conditions, hourly rail, daily forecast, details, units, cache, and briefing rules.
- Add complete loading, refresh, empty, denial, offline, and error states.

### Phase 3 — polish and verification

- Refine typography, spacing, iconography, dark mode, and reduced motion.
- Run automated tests and manual accessibility/responsive checks.
- Have an independent reviewer assess the exact implementation commit against the confirmed brief.

### Later candidates (require a new brief)

- Saved locations synced with an account.
- Official severe-weather alerts and user-controlled notifications.
- Interactive radar or maps.
- Air quality, pollen, travel, and outdoor-activity modules.
- Native mobile apps and offline support.

## 12. Risks and decisions to revisit

- **Provider terms/availability:** validate before public release and keep the repository boundary.
- **Forecast precision:** present probabilities and times honestly; avoid wording that implies guarantees.
- **Location ambiguity:** show region/country and coordinates where necessary.
- **Timezone correctness:** render all hourly/daily time in the selected location’s timezone, not the browser’s timezone.
- **Scope creep:** alerts, accounts, radar, and maps are valuable but materially expand product and operational complexity.
- **Visual overproduction:** premium should mean restraint and legibility, not heavy effects or ornamental motion.

## 13. Open decisions for the human owner

These choices should be confirmed in the implementation brief:

1. The frontend framework and deployment target.
2. Whether dark mode follows the system setting only or also has a manual toggle.
3. Whether “recent locations” is sufficient for release 1 or a pinned-favorites list is required.
4. The supported countries/languages for place search and product copy.
5. The intended launch context (portfolio/demo, private tool, or public product), which determines provider/commercial review depth.

## 14. Next approval gate

This document is a product plan, not an implementation ticket. Before any task is assigned to the Builder, a human must directly confirm a versioned implementation brief that selects the technology and release-1 boundaries above. The handoff must name the task ID, brief revision, expected behavior, and exclusions.
