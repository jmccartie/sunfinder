const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve static files from the React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../public')));
}

// Major US cities with their coordinates (for finding nearby cities)
const MAJOR_CITIES = [
  { name: 'New York', lat: 40.7128, lon: -74.0060 },
  { name: 'Los Angeles', lat: 34.0522, lon: -118.2437 },
  { name: 'Chicago', lat: 41.8781, lon: -87.6298 },
  { name: 'Houston', lat: 29.7604, lon: -95.3698 },
  { name: 'Phoenix', lat: 33.4484, lon: -112.0740 },
  { name: 'Philadelphia', lat: 39.9526, lon: -75.1652 },
  { name: 'San Antonio', lat: 29.4241, lon: -98.4936 },
  { name: 'San Diego', lat: 32.7157, lon: -117.1611 },
  { name: 'Dallas', lat: 32.7767, lon: -96.7970 },
  { name: 'San Jose', lat: 37.3382, lon: -121.8863 },
  { name: 'Austin', lat: 30.2672, lon: -97.7431 },
  { name: 'Jacksonville', lat: 30.3322, lon: -81.6557 },
  { name: 'Fort Worth', lat: 32.7555, lon: -97.3308 },
  { name: 'Columbus', lat: 39.9612, lon: -82.9988 },
  { name: 'Charlotte', lat: 35.2271, lon: -80.8431 },
  { name: 'San Francisco', lat: 37.7749, lon: -122.4194 },
  { name: 'Indianapolis', lat: 39.7684, lon: -86.1581 },
  { name: 'Seattle', lat: 47.6062, lon: -122.3321 },
  { name: 'Denver', lat: 39.7392, lon: -104.9903 },
  { name: 'Washington', lat: 38.9072, lon: -77.0369 },
  { name: 'Boston', lat: 42.3601, lon: -71.0589 },
  { name: 'El Paso', lat: 31.7619, lon: -106.4850 },
  { name: 'Nashville', lat: 36.1627, lon: -86.7816 },
  { name: 'Detroit', lat: 42.3314, lon: -83.0458 },
  { name: 'Oklahoma City', lat: 35.4676, lon: -97.5164 },
  { name: 'Portland', lat: 45.5152, lon: -122.6784 },
  { name: 'Las Vegas', lat: 36.1699, lon: -115.1398 },
  { name: 'Memphis', lat: 35.1495, lon: -90.0490 },
  { name: 'Louisville', lat: 38.2527, lon: -85.7585 },
  { name: 'Baltimore', lat: 39.2904, lon: -76.6122 },
  { name: 'Milwaukee', lat: 43.0389, lon: -87.9065 },
  { name: 'Albuquerque', lat: 35.0844, lon: -106.6504 },
  { name: 'Tucson', lat: 32.2226, lon: -110.9747 },
  { name: 'Fresno', lat: 36.7378, lon: -119.7871 },
  { name: 'Sacramento', lat: 38.5816, lon: -121.4944 },
  { name: 'Kansas City', lat: 39.0997, lon: -94.5786 },
  { name: 'Mesa', lat: 33.4152, lon: -111.8315 },
  { name: 'Atlanta', lat: 33.7490, lon: -84.3880 },
  { name: 'Omaha', lat: 41.2565, lon: -95.9345 },
  { name: 'Colorado Springs', lat: 38.8339, lon: -104.8214 },
  { name: 'Raleigh', lat: 35.7796, lon: -78.6382 },
  { name: 'Miami', lat: 25.7617, lon: -80.1918 },
  { name: 'Virginia Beach', lat: 36.8529, lon: -75.9780 },
  { name: 'Oakland', lat: 37.8044, lon: -122.2712 },
  { name: 'Minneapolis', lat: 44.9778, lon: -93.2650 },
  { name: 'Tulsa', lat: 36.1540, lon: -95.9928 },
  { name: 'Cleveland', lat: 41.4993, lon: -81.6944 },
  { name: 'Wichita', lat: 37.6872, lon: -97.3301 },
  { name: 'Arlington', lat: 32.7357, lon: -97.1081 },
];

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Check if weather is considered "sunny"
// Sunny = Clear, or partly cloudy (few/scattered clouds, but not overcast/rain/snow)
function isSunnyWeather(weatherMain, weatherDescription) {
  const description = weatherDescription.toLowerCase();
  
  // Clear skies = definitely sunny
  if (weatherMain === 'Clear') {
    return true;
  }
  
  // Partly cloudy = sunny (few clouds, scattered clouds)
  if (weatherMain === 'Clouds') {
    if (description.includes('few clouds') || description.includes('scattered clouds')) {
      return true;
    }
    // Overcast or broken clouds = not sunny
    return false;
  }
  
  // Rain, Snow, Thunderstorm, etc. = not sunny
  return false;
}

// Get emoji for weather condition
function getWeatherEmoji(weatherMain, weatherDescription) {
  const description = weatherDescription.toLowerCase();
  
  // Clear skies
  if (weatherMain === 'Clear') {
    return '☀️';
  }
  
  // Clouds
  if (weatherMain === 'Clouds') {
    if (description.includes('few clouds')) {
      return '🌤️';
    }
    if (description.includes('scattered clouds')) {
      return '⛅';
    }
    // Broken clouds or overcast
    return '☁️';
  }
  
  // Rain
  if (weatherMain === 'Rain') {
    if (description.includes('light') || description.includes('drizzle')) {
      return '🌦️';
    }
    return '🌧️';
  }
  
  // Thunderstorm
  if (weatherMain === 'Thunderstorm') {
    return '⛈️';
  }
  
  // Snow
  if (weatherMain === 'Snow') {
    return '❄️';
  }
  
  // Mist/Fog
  if (weatherMain === 'Mist' || weatherMain === 'Fog') {
    return '🌫️';
  }
  
  // Haze
  if (weatherMain === 'Haze') {
    return '🌫️';
  }
  
  // Dust/Sand
  if (weatherMain === 'Dust' || weatherMain === 'Sand') {
    return '🌪️';
  }
  
  // Squall
  if (weatherMain === 'Squall') {
    return '💨';
  }
  
  // Tornado
  if (weatherMain === 'Tornado') {
    return '🌪️';
  }
  
  // Default
  return '🌤️';
}

// Get weather for a city
async function getWeatherForCity(city, minTemp = 60) {
  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      throw new Error('OPENWEATHER_API_KEY not configured');
    }

    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather`,
      {
        params: {
          lat: city.lat,
          lon: city.lon,
          appid: apiKey,
          units: 'imperial'
        }
      }
    );

    const weatherMain = response.data.weather[0].main;
    const weatherDescription = response.data.weather[0].description;
    const currentTemp = response.data.main.temp;
    const highTemp = response.data.main.temp_max;

    return {
      city: city.name,
      weather: weatherMain,
      description: weatherDescription,
      emoji: getWeatherEmoji(weatherMain, weatherDescription),
      temp: currentTemp,
      highTemp: highTemp,
      isSunny: isSunnyWeather(weatherMain, weatherDescription) && highTemp >= minTemp
    };
  } catch (error) {
    console.error(`Error fetching weather for ${city.name}:`, error.message);
    return null;
  }
}

// Get forecast for a city (5-day forecast)
async function getForecastForCity(city) {
  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      throw new Error('OPENWEATHER_API_KEY not configured');
    }

    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast`,
      {
        params: {
          lat: city.lat,
          lon: city.lon,
          appid: apiKey,
          units: 'imperial'
        }
      }
    );

    // Group forecast by day (the API returns 3-hour intervals)
    const forecastsByDay = {};
    
    response.data.list.forEach(item => {
      const date = new Date(item.dt * 1000);
      const dayKey = date.toDateString();
      
      if (!forecastsByDay[dayKey]) {
        forecastsByDay[dayKey] = {
          date: date,
          temps: [],
          conditions: [],
          descriptions: []
        };
      }
      
      forecastsByDay[dayKey].temps.push(item.main.temp);
      forecastsByDay[dayKey].conditions.push(item.weather[0].main);
      forecastsByDay[dayKey].descriptions.push(item.weather[0].description);
    });

    // Convert to array and format for each day
    const dailyForecast = Object.values(forecastsByDay)
      .map(day => {
        const high = Math.round(Math.max(...day.temps));
        const low = Math.round(Math.min(...day.temps));
        // Get the most common condition for the day
        const mostCommonCondition = day.conditions.reduce((a, b, i, arr) =>
          arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b
        );
        const mostCommonDescription = day.descriptions.reduce((a, b, i, arr) =>
          arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b
        );
        
        return {
          date: day.date,
          dayName: day.date.toLocaleDateString('en-US', { weekday: 'short' }),
          high,
          low,
          condition: mostCommonCondition,
          description: mostCommonDescription,
          emoji: getWeatherEmoji(mostCommonCondition, mostCommonDescription)
        };
      })
      .slice(0, 5); // Limit to 5 days

    return dailyForecast;
  } catch (error) {
    console.error(`Error fetching forecast for ${city.name}:`, error.message);
    return null;
  }
}

// Convert zip code to coordinates
async function zipToCoordinates(zipCode) {
  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      throw new Error('OPENWEATHER_API_KEY not configured');
    }

    const response = await axios.get(
      `http://api.openweathermap.org/geo/1.0/zip`,
      {
        params: {
          zip: `${zipCode},US`,
          appid: apiKey
        }
      }
    );

    return {
      lat: response.data.lat,
      lon: response.data.lon,
      name: response.data.name
    };
  } catch (error) {
    throw new Error(`Could not find location for zip code ${zipCode}`);
  }
}

app.post('/api/find-sunny-city', async (req, res) => {
  try {
    const { zipCode, minTemp } = req.body;
    const minTemperature = parseInt(minTemp) || 60;

    if (!zipCode) {
      return res.status(400).json({ error: 'Zip code is required' });
    }

    // Convert zip code to coordinates
    const zipLocation = await zipToCoordinates(zipCode);

    // Find nearby cities (within 1000 miles to give more options)
    const nearbyCities = MAJOR_CITIES
      .map(city => ({
        ...city,
        distance: calculateDistance(zipLocation.lat, zipLocation.lon, city.lat, city.lon)
      }))
      .filter(city => city.distance <= 1000)
      .sort((a, b) => a.distance - b.distance);

    if (nearbyCities.length === 0) {
      return res.status(404).json({ 
        error: 'No major cities found within 1000 miles of this zip code' 
      });
    }

    // Check cities sequentially from nearest to farthest until we find a sunny one
    let sunnyCity = null;
    let checkedCities = [];
    
    for (const city of nearbyCities) {
      const weatherResult = await getWeatherForCity(city, minTemperature);
      
      if (weatherResult === null) {
        // Skip if API call failed
        continue;
      }
      
      checkedCities.push({
        ...weatherResult,
        distance: city.distance
      });
      
      // If this city is sunny, we found it!
      if (weatherResult.isSunny) {
        sunnyCity = {
          ...weatherResult,
          distance: city.distance
        };
        break; // Stop searching once we find a sunny city
      }
    }

    if (sunnyCity) {
      // Get the city object to fetch forecast
      const cityObj = nearbyCities.find(c => c.name === sunnyCity.city);
      const forecast = await getForecastForCity(cityObj);
      
      return res.json({
        success: true,
        city: sunnyCity.city,
        weather: sunnyCity.weather,
        description: sunnyCity.description,
        emoji: sunnyCity.emoji,
        temperature: Math.round(sunnyCity.temp),
        highTemp: Math.round(sunnyCity.highTemp),
        distance: Math.round(sunnyCity.distance),
        zipLocation: zipLocation.name,
        forecast: forecast || []
      });
    } else {
      // If no sunny city found after checking all nearby cities
      if (checkedCities.length === 0) {
        return res.status(500).json({ 
          error: 'Could not retrieve weather data for any nearby cities' 
        });
      }
      
      // Return the closest city we checked (even though it's not sunny)
      const closestCity = checkedCities[0];
      const cityObj = nearbyCities.find(c => c.name === closestCity.city);
      const forecast = await getForecastForCity(cityObj);
      
      return res.json({
        success: false,
        message: `No sunny cities found within 1000 miles (with high temp ≥${minTemperature}°F)`,
        closestCity: closestCity.city,
        weather: closestCity.weather,
        description: closestCity.description,
        emoji: closestCity.emoji,
        temperature: Math.round(closestCity.temp),
        highTemp: closestCity.highTemp ? Math.round(closestCity.highTemp) : null,
        distance: Math.round(closestCity.distance),
        zipLocation: zipLocation.name,
        forecast: forecast || []
      });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Serve React app in production (catch-all handler)
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


