import { FormEvent } from 'react'
import type { Location } from '../domain/weather'

type Props = {
  query: string
  results: Location[]
  isSearching: boolean
  error?: string
  onQueryChange: (query: string) => void
  onSearch: () => void
  onSelect: (location: Location) => void
}

export function LocationSearch({ query, results, isSearching, error, onQueryChange, onSearch, onSelect }: Props) {
  function submit(event: FormEvent) {
    event.preventDefault()
    onSearch()
  }

  return <section className="search-panel" aria-labelledby="search-heading">
    <p className="eyebrow">Your weather, clearly</p>
    <h1 id="search-heading">Find a city</h1>
    <p className="subtle">Search by city, then choose the right region.</p>
    <form className="search-form" onSubmit={submit}>
      <label htmlFor="city-search">City or place</label>
      <div className="search-controls">
        <input id="city-search" value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="e.g. London" autoComplete="off" />
        <button type="submit" disabled={isSearching}>{isSearching ? 'Searching…' : 'Search'}</button>
      </div>
    </form>
    {error && <p className="status error" role="alert">{error}</p>}
    {results.length > 0 && <ul className="location-results" aria-label="Matching locations">
      {results.map((location) => <li key={location.id}>
        <button className="location-option" onClick={() => onSelect(location)}>
          <strong>{location.name}</strong>
          <span>{[location.region, location.country].filter(Boolean).join(', ')}</span>
        </button>
      </li>)}
    </ul>}
  </section>
}
