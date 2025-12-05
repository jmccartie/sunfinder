# ☀️ Sun Finder

A simple web application that finds the closest major city with sunny weather near any US zip code.

## Features

- Enter a zip code to find nearby sunny cities
- Searches within 500 miles of your location
- Displays weather conditions, temperature, and distance
- Beautiful, modern UI with gradient design

## Setup

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- OpenWeatherMap API key (free at [openweathermap.org](https://openweathermap.org/api))

### Installation

1. Clone or navigate to this directory
2. Install dependencies:
   ```bash
   npm run install-all
   ```

3. Create a `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```

4. Add your OpenWeatherMap API key to `.env`:
   ```
   OPENWEATHER_API_KEY=your_actual_api_key_here
   PORT=3001
   ```

### Running the Application

Start both the backend server and frontend client:

```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:3001`
- Frontend client on `http://localhost:5173` (or another port if 5173 is taken)

You can also run them separately:

```bash
# Backend only
npm run server

# Frontend only (in another terminal)
npm run client
```

## How It Works

1. User enters a zip code
2. Backend converts the zip code to coordinates using OpenWeatherMap's geocoding API
3. Backend finds major cities within 500 miles
4. Backend checks weather for each nearby city
5. Returns the closest city with clear/sunny weather
6. If no sunny city is found, returns the closest city with its current weather

## API Endpoints

### POST `/api/find-sunny-city`

Request body:
```json
{
  "zipCode": "10001"
}
```

Response (success):
```json
{
  "success": true,
  "city": "New York",
  "weather": "Clear",
  "description": "clear sky",
  "temperature": 72,
  "distance": 5,
  "zipLocation": "New York"
}
```

Response (no sunny city found):
```json
{
  "success": false,
  "message": "No sunny cities found nearby",
  "closestCity": "Chicago",
  "weather": "Clouds",
  "description": "few clouds",
  "temperature": 65,
  "distance": 120,
  "zipLocation": "New York"
}
```

## Tech Stack

- **Backend**: Node.js + Express
- **Frontend**: React + Vite
- **Weather API**: OpenWeatherMap
- **Styling**: CSS with modern gradients

## Notes

- The app searches within 1000 miles of the entered zip code
- Only checks major US cities (top 50 by population)
- Weather data includes current conditions and 5-day forecast
- "Sunny" is defined as "Clear" or partly cloudy weather with high temp ≥60°F

## Deployment to Heroku

### Prerequisites

- Heroku account (free at [heroku.com](https://www.heroku.com))
- Heroku CLI installed ([instructions](https://devcenter.heroku.com/articles/heroku-cli))

### Deployment Steps

1. **Login to Heroku:**
   ```bash
   heroku login
   ```

2. **Create a new Heroku app:**
   ```bash
   heroku create your-app-name
   ```
   (Replace `your-app-name` with your desired app name, or leave it out to auto-generate)

3. **Set your OpenWeatherMap API key:**
   ```bash
   heroku config:set OPENWEATHER_API_KEY=your_actual_api_key_here
   ```

4. **Deploy to Heroku:**
   ```bash
   git add .
   git commit -m "Prepare for Heroku deployment"
   git push heroku main
   ```
   (If your default branch is `master`, use `git push heroku master`)

5. **Open your app:**
   ```bash
   heroku open
   ```

### Troubleshooting

- **View logs:** `heroku logs --tail`
- **Check config vars:** `heroku config`
- **Restart app:** `heroku restart`

The app will automatically:
- Build the React frontend during deployment
- Serve both API and frontend from the same Heroku dyno
- Use the `PORT` environment variable set by Heroku


