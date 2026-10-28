import { useState } from 'react'
import { LocationSearch } from './components/LocationSearch'
import { CurrentWeatherView } from './components/CurrentWeatherView'
import { OpenMeteoRepository } from './data/openMeteo'
import type { CurrentWeather, Location, WeatherRepository } from './domain/weather'

const defaultRepository = new OpenMeteoRepository()

export function App({ repository = defaultRepository }: { repository?: WeatherRepository }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Location[]>([])
  const [weather, setWeather] = useState<CurrentWeather | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [isLoadingWeather, setIsLoadingWeather] = useState(false)
  const [error, setError] = useState<string | undefined>()
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)

  async function search() {
    const trimmed = query.trim()
    setError(undefined)
    setWeather(null)
    setResults([])
    if (!trimmed) {
      setError('Enter a city or place to begin.')
      return
    }
    setIsSearching(true)
    try {
      const locations = await repository.searchLocations(trimmed)
      setResults(locations)
      if (locations.length === 0) setError('No matching locations. Try adding a country or region.')
    } catch {
      setError('We could not search for that location. Check your connection and try again.')
    } finally {
      setIsSearching(false)
    }
  }

  async function select(location: Location) {
    setSelectedLocation(location)
    setResults([])
    setError(undefined)
    setIsLoadingWeather(true)
    try {
      const current = await repository.getCurrentWeather(location)
      setWeather(current)
      document.title = `${location.name} weather · Weather, clearly`
    } catch {
      setError(`We could not load weather for ${location.name}. Please try again.`)
    } finally {
      setIsLoadingWeather(false)
    }
  }

  return <div className="app-shell">
    <header className="site-header"><a href="/" className="brand">weather<span>—</span>clearly</a></header>
    {weather ? <>
      <CurrentWeatherView weather={weather} />
      <button className="change-location" onClick={() => { setWeather(null); setQuery('') }}>Change location</button>
    </> : <>
      <LocationSearch query={query} results={results} isSearching={isSearching} error={error} onQueryChange={setQuery} onSearch={search} onSelect={select} />
      {isLoadingWeather && <p className="status loading" role="status">Loading current weather…</p>}
      {selectedLocation && !isLoadingWeather && error && <button className="retry" onClick={() => select(selectedLocation)}>Retry</button>}
    </>}
  </div>
}
