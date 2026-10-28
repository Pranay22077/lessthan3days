export type Location = {
  id: string
  name: string
  region?: string
  country: string
  latitude: number
  longitude: number
  timezone: string
}

export type WeatherCondition = {
  code: number
  label: string
  symbol: string
}

export type CurrentWeather = {
  location: Location
  observedAt: string
  timezone: string
  temperatureC: number
  feelsLikeC: number
  condition: WeatherCondition
  precipitationMm: number
  humidityPercent: number
  windSpeedKph: number
  windDirectionDegrees: number
  uvIndex: number
}

export interface WeatherRepository {
  searchLocations(query: string): Promise<Location[]>
  getCurrentWeather(location: Location): Promise<CurrentWeather>
}
