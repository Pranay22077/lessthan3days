import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { App } from './App'
import type { CurrentWeather, Location, WeatherRepository } from './domain/weather'

const london: Location = { id: '1', name: 'London', region: 'England', country: 'United Kingdom', latitude: 51.5, longitude: -0.12, timezone: 'Europe/London' }
const current: CurrentWeather = { location: london, observedAt: '2026-10-29T12:00', timezone: 'Europe/London', temperatureC: 12, feelsLikeC: 10, condition: { code: 61, label: 'Light rain', symbol: '☂' }, precipitationMm: .4, humidityPercent: 70, windSpeedKph: 18, windDirectionDegrees: 210, uvIndex: 2 }

function repository(overrides: Partial<WeatherRepository> = {}): WeatherRepository {
  return { searchLocations: async () => [london], getCurrentWeather: async () => current, ...overrides }
}

describe('weather app location flow', () => {
  it('allows a keyboard user to search, disambiguate, select, and view current weather', async () => {
    const user = userEvent.setup()
    render(<App repository={repository()} />)
    await user.type(screen.getByLabelText('City or place'), 'London')
    await user.keyboard('{Enter}')
    const choice = await screen.findByRole('button', { name: /London.*England, United Kingdom/i })
    await user.click(choice)
    expect(await screen.findByRole('heading', { name: 'London' })).toBeInTheDocument()
    expect(screen.getByLabelText('Current weather in London')).toHaveTextContent('12°C')
    expect(screen.getByText(/Forecast data by/i)).toBeInTheDocument()
  })

  it('shows a recoverable error when the weather provider fails', async () => {
    const user = userEvent.setup()
    render(<App repository={repository({ getCurrentWeather: async () => { throw new Error('offline') } })} />)
    await user.type(screen.getByLabelText('City or place'), 'London')
    await user.click(screen.getByRole('button', { name: 'Search' }))
    await user.click(await screen.findByRole('button', { name: /London.*England/i }))
    expect(await screen.findByRole('alert')).toHaveTextContent('We could not load weather for London')
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument()
  })

  it('explains an empty result instead of presenting an empty list', async () => {
    const user = userEvent.setup()
    render(<App repository={repository({ searchLocations: async () => [] })} />)
    await user.type(screen.getByLabelText('City or place'), 'NoSuchPlace')
    await user.click(screen.getByRole('button', { name: 'Search' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('No matching locations')
  })
})
