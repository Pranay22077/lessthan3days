import { describe, expect, it } from 'vitest'
import { conditionFromCode, normalizeCurrentWeather, normalizeLocations, WeatherProviderError } from './openMeteo'
import type { Location } from '../domain/weather'

const london: Location = { id: '2643743', name: 'London', region: 'England', country: 'United Kingdom', latitude: 51.5, longitude: -0.12, timezone: 'Europe/London' }

describe('Open-Meteo normalization', () => {
  it('keeps enough geography to disambiguate search results', () => {
    expect(normalizeLocations({ results: [
      { id: 1, name: 'London', admin1: 'England', country: 'United Kingdom', latitude: 51.5, longitude: -0.1, timezone: 'Europe/London' },
      { id: 2, name: 'London', admin1: 'Ontario', country: 'Canada', latitude: 42.9, longitude: -81.2, timezone: 'America/Toronto' },
    ] })).toEqual(expect.arrayContaining([
      expect.objectContaining({ name: 'London', region: 'England', country: 'United Kingdom' }),
      expect.objectContaining({ name: 'London', region: 'Ontario', country: 'Canada' }),
    ]))
  })

  it('maps current provider data to a stable weather model', () => {
    const weather = normalizeCurrentWeather({ timezone: 'Europe/London', current: {
      time: '2026-10-29T12:00', temperature_2m: 12.4, apparent_temperature: 10.8,
      weather_code: 61, precipitation: 0.4, relative_humidity_2m: 72,
      wind_speed_10m: 18, wind_direction_10m: 210, uv_index: 2,
    } }, london)
    expect(weather).toMatchObject({ location: london, temperatureC: 12.4, condition: { label: 'Light rain', symbol: '☂' }, windSpeedKph: 18 })
  })

  it('rejects malformed provider data instead of inventing a forecast', () => {
    expect(() => normalizeCurrentWeather({ current: { temperature_2m: 12 } }, london)).toThrow(WeatherProviderError)
    expect(conditionFromCode(999).label).toBe('Unknown conditions')
  })
})
