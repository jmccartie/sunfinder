import { useState } from 'react'
import './App.css'

function App() {
  const [zipCode, setZipCode] = useState('')
  const [minTemp, setMinTemp] = useState('60')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  // Use environment variable for API URL in development, or same origin in production (Heroku)
  const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001' : '')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      // Use API_URL if set, otherwise use relative path (same origin on Heroku)
      const apiEndpoint = API_URL ? `${API_URL}/api/find-sunny-city` : '/api/find-sunny-city'
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ zipCode, minTemp: parseInt(minTemp) || 60 }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong')
      }

      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <div className="container">
        <h1>☀️ Sun Finder</h1>
        <p className="subtitle">Find the closest sunny city near your zip code</p>

        <form onSubmit={handleSubmit} className="form">
          <div className="input-group">
            <div className="zip-input-wrapper">
              <label htmlFor="zip-code" className="zip-label">Zip Code:</label>
              <input
                id="zip-code"
                type="text"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                placeholder="Enter zip code (e.g., 10001)"
                className="zip-input"
                disabled={loading}
                required
              />
            </div>
            <div className="temp-input-wrapper">
              <label htmlFor="min-temp" className="temp-label">Min Temp (°F):</label>
              <input
                id="min-temp"
                type="number"
                value={minTemp}
                onChange={(e) => setMinTemp(e.target.value)}
                placeholder="60"
                className="temp-input"
                disabled={loading}
                min="0"
                max="120"
              />
            </div>
            <button 
              type="submit" 
              className="submit-btn"
              disabled={loading || !zipCode.trim()}
            >
              {loading ? 'Searching...' : 'Find Sunny City'}
            </button>
          </div>
        </form>

        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        {result && (
          <div className={`result-card ${result.success ? 'success' : 'no-sun'}`}>
            {result.success ? (
              <>
                <div className="result-header">
                  <span className="sun-icon">☀️</span>
                  <h2>Found a Sunny City!</h2>
                </div>
                <div className="result-content">
                  <div className="result-item">
                    <strong>City:</strong> {result.city}
                  </div>
                  <div className="result-item weather-with-icon">
                    <strong>Weather:</strong> 
                    {result.emoji && (
                      <span className="weather-emoji">{result.emoji}</span>
                    )}
                    <span>{result.description}</span>
                  </div>
                  <div className="result-item">
                    <strong>Temperature:</strong> {result.temperature}°F
                    {result.highTemp && (
                      <span> (High: {result.highTemp}°F)</span>
                    )}
                  </div>
                  <div className="result-item">
                    <strong>Distance:</strong> {result.distance} miles from {result.zipLocation}
                  </div>
                  {result.forecast && result.forecast.length > 0 && (
                    <div className="forecast-section">
                      <h3 className="forecast-title">5-Day Forecast</h3>
                      <div className="forecast-grid">
                        {result.forecast.map((day, index) => (
                          <div key={index} className="forecast-day">
                            <div className="forecast-day-name">{day.dayName}</div>
                            {day.emoji && (
                              <span className="forecast-emoji">{day.emoji}</span>
                            )}
                            <div className="forecast-temps">
                              <span className="forecast-high">{day.high}°</span>
                              <span className="forecast-low">/{day.low}°</span>
                            </div>
                            <div className="forecast-condition">{day.description}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="result-header">
                  <span className="cloud-icon">☁️</span>
                  <h2>No Sunny Cities Nearby</h2>
                </div>
                <div className="result-content">
                  <p className="no-sun-message">{result.message}</p>
                  <div className="result-item">
                    <strong>Closest City:</strong> {result.closestCity}
                  </div>
                  <div className="result-item weather-with-icon">
                    <strong>Weather:</strong> 
                    {result.emoji && (
                      <span className="weather-emoji">{result.emoji}</span>
                    )}
                    <span>{result.description}</span>
                  </div>
                  <div className="result-item">
                    <strong>Temperature:</strong> {result.temperature}°F
                    {result.highTemp && (
                      <span> (High: {result.highTemp}°F)</span>
                    )}
                  </div>
                  <div className="result-item">
                    <strong>Distance:</strong> {result.distance} miles from {result.zipLocation}
                  </div>
                  {result.forecast && result.forecast.length > 0 && (
                    <div className="forecast-section">
                      <h3 className="forecast-title">5-Day Forecast</h3>
                      <div className="forecast-grid">
                        {result.forecast.map((day, index) => (
                          <div key={index} className="forecast-day">
                            <div className="forecast-day-name">{day.dayName}</div>
                            {day.emoji && (
                              <span className="forecast-emoji">{day.emoji}</span>
                            )}
                            <div className="forecast-temps">
                              <span className="forecast-high">{day.high}°</span>
                              <span className="forecast-low">/{day.low}°</span>
                            </div>
                            <div className="forecast-condition">{day.description}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
