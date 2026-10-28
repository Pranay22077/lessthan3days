import type { CurrentWeather, Location, WeatherCondition, WeatherRepository } from '../domain/weather'

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search'
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast'

type Fetcher = typeof fetch

export class WeatherProviderError extends Error {
  constructor(message = 'The weather provider could not complete the request.') {
    super(message)
    this.name = 'WeatherProviderError'
  }
}

export function conditionFromCode(code: number): WeatherCondition {
  const conditions: Record<number, Omit<WeatherCondition, 'code'>> = {
    0: { label: 'Clear sky', symbol: '☀' },
    1: { label: 'Mostly clear', symbol: '◌' },
    2: { label: 'Partly cloudy', symbol: '◐' },
    3: { label: 'Overcast', symbol: '☁' },
    45: { label: 'Fog', symbol: '≋' },
    48: { label: 'Rime fog', symbol: '≋' },
    51: { label: 'Light drizzle', symbol: '☂' },
    53: { label: 'Drizzle', symbol: '☂' },
    55: { label: 'Heavy drizzle', symbol: '☂' },
    61: { label: 'Light rain', symbol: '☂' },
    63: { label: 'Rain', symbol: '☂' },
    65: { label: 'Heavy rain', symbol: '☂' },
    71: { label: 'Light snow', symbol: '❄' },
    73: { label: 'Snow', symbol: '❄' },
    75: { label: 'Heavy snow', symbol: '❄' },
    80: { label: 'Rain showers', symbol: '☂' },
    81: { label: 'Rain showers', symbol: '☂' },
    82: { label: 'Heavy showers', symbol: '☂' },
    95: { label: 'Thunderstorm', symbol: 'ϟ' },
  }
  return { code, ...(conditions[code] ?? { label: 'Unknown conditions', symbol: '○' }) }
}

type GeocodingResponse = {
  results?: Array<{
    id: number
    name: string
    admin1?: string
    country: string
    latitude: number
    longitude: number
    timezone: string
  }>
}

type ForecastResponse = {
  timezone?: string
  current?: {
    time: string
    temperature_2m: number
    apparent_temperature: number
    weather_code: number
    precipitation: number
    relative_humidity_2m: number
    wind_speed_10m: number
    wind_direction_10m: number
    uv_index: number
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function normalizeLocations(payload: unknown): Location[] {
  if (!isObject(payload) || !Array.isArray(payload.results)) return []
  return (payload as GeocodingResponse).results!.filter(
    (result) =>
      typeof result.id === 'number' &&
      typeof result.name === 'string' &&
      typeof result.country === 'string' &&
      typeof result.latitude === 'number' &&
      typeof result.longitude === 'number' &&
      typeof result.timezone === 'string',
  ).map((result) => ({
    id: String(result.id),
    name: result.name,
    region: result.admin1,
    country: result.country,
    latitude: result.latitude,
    longitude: result.longitude,
    timezone: result.timezone,
  }))
}

export function normalizeCurrentWeather(payload: unknown, location: Location): CurrentWeather {
  if (!isObject(payload) || !isObject(payload.current)) throw new WeatherProviderError('The provider returned incomplete weather data.')
  const response = payload as ForecastResponse
  const current = response.current!
  const required = [
    current.time, current.temperature_2m, current.apparent_temperature, current.weather_code,
    current.precipitation, current.relative_humidity_2m, current.wind_speed_10m,
    current.wind_direction_10m, current.uv_index,
  ]
  if (required.some((value) => typeof value !== 'string' && typeof value !== 'number')) {
    throw new WeatherProviderError('The provider returned incomplete weather data.')
  }
  return {
    location,
    observedAt: current.time,
    timezone: response.timezone ?? location.timezone,
    temperatureC: current.temperature_2m,
    feelsLikeC: current.apparent_temperature,
    condition: conditionFromCode(current.weather_code),
    precipitationMm: current.precipitation,
    humidityPercent: current.relative_humidity_2m,
    windSpeedKph: current.wind_speed_10m,
    windDirectionDegrees: current.wind_direction_10m,
    uvIndex: current.uv_index,
  }
}

async function requestJson(fetcher: Fetcher, url: string): Promise<unknown> {
  let response: Response
  try {
    response = await fetcher(url)
  } catch {
    throw new WeatherProviderError()
  }
  if (!response.ok) throw new WeatherProviderError()
  try {
    return await response.json()
  } catch {
    throw new WeatherProviderError('The provider returned unreadable data.')
  }
}

export class OpenMeteoRepository implements WeatherRepository {
  constructor(private readonly fetcher: Fetcher = fetch) {}

  async searchLocations(query: string): Promise<Location[]> {
    const url = new URL(GEOCODING_URL)
    url.searchParams.set('name', query)
    url.searchParams.set('count', '6')
    url.searchParams.set('language', 'en')
    url.searchParams.set('format', 'json')
    return normalizeLocations(await requestJson(this.fetcher, url.toString()))
  }

  async getCurrentWeather(location: Location): Promise<CurrentWeather> {
    const url = new URL(FORECAST_URL)
    url.searchParams.set('latitude', String(location.latitude))
    url.searchParams.set('longitude', String(location.longitude))
    url.searchParams.set('timezone', 'auto')
    url.searchParams.set('current', 'temperature_2m,apparent_temperature,weather_code,precipitation,relative_humidity_2m,wind_speed_10m,wind_direction_10m,uv_index')
    return normalizeCurrentWeather(await requestJson(this.fetcher, url.toString()), location)
  }
}
