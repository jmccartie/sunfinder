import { useState } from 'react'
import './App.css'

function App() {
  const [zipCode, setZipCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  // Use environment variable for API URL, fallback to localhost for development
  // In production, VITE_API_URL must be set in Netlify environment variables
  const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001' : '')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    // Check if API URL is missing
    if (!API_URL) {
      setError('API configuration error: Please set VITE_API_URL environment variable')
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`${API_URL}/api/find-sunny-city`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ zipCode }),
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
        <p className="subtitle">Find the closest sunny city (high temp ≥60°F) near your zip code</p>

        <form onSubmit={handleSubmit} className="form">
          <div className="input-group">
            <input
              type="text"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              placeholder="Enter zip code (e.g., 10001)"
              className="zip-input"
              disabled={loading}
              required
            />
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
