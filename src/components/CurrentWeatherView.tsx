import type { CurrentWeather } from '../domain/weather'

export function formatProviderLocalTime(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value)
  if (!match) return value

  // Open-Meteo returns `current.time` in the requested location timezone.
  // Build a UTC date solely to preserve its wall-clock fields while formatting;
  // converting that local value into the location timezone would shift it twice.
  const [, year, month, day, hour, minute] = match
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute)))
  return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' }).format(date)
}

export function CurrentWeatherView({ weather }: { weather: CurrentWeather }) {
  const { location } = weather
  return <main className="weather-view" aria-labelledby="weather-heading">
    <header className="weather-header">
      <div>
        <p className="eyebrow">Current conditions</p>
        <h1 id="weather-heading">{location.name}</h1>
        <p className="subtle" data-testid="local-time">{[location.region, location.country].filter(Boolean).join(', ')} · {formatProviderLocalTime(weather.observedAt)}</p>
      </div>
      <span className="condition-symbol" aria-label={weather.condition.label}>{weather.condition.symbol}</span>
    </header>
    <section className="hero" aria-label={`Current weather in ${location.name}`}>
      <p className="temperature">{Math.round(weather.temperatureC)}<span>°C</span></p>
      <div>
        <p className="condition-label">{weather.condition.label}</p>
        <p className="subtle">Feels like {Math.round(weather.feelsLikeC)}°C</p>
      </div>
    </section>
    <dl className="metrics">
      <div><dt>Rain</dt><dd>{weather.precipitationMm} mm</dd></div>
      <div><dt>Humidity</dt><dd>{weather.humidityPercent}%</dd></div>
      <div><dt>Wind</dt><dd>{Math.round(weather.windSpeedKph)} km/h</dd></div>
      <div><dt>UV index</dt><dd>{weather.uvIndex}</dd></div>
    </dl>
    <footer className="source-note">Updated {formatProviderLocalTime(weather.observedAt)} · Forecast data by <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo</a></footer>
  </main>
}
