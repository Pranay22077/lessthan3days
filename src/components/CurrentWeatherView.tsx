import type { CurrentWeather } from '../domain/weather'

function formatTime(value: string, timezone: string) {
  const date = new Date(`${value}Z`)
  return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: timezone }).format(date)
}

export function CurrentWeatherView({ weather }: { weather: CurrentWeather }) {
  const { location } = weather
  return <main className="weather-view" aria-labelledby="weather-heading">
    <header className="weather-header">
      <div>
        <p className="eyebrow">Current conditions</p>
        <h1 id="weather-heading">{location.name}</h1>
        <p className="subtle">{[location.region, location.country].filter(Boolean).join(', ')} · {formatTime(weather.observedAt, weather.timezone)}</p>
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
    <footer className="source-note">Updated {formatTime(weather.observedAt, weather.timezone)} · Forecast data by <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo</a></footer>
  </main>
}
