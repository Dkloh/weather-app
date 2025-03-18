import React, { useState, useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaSun, FaCloudRain, FaCloud, FaSnowflake } from 'react-icons/fa';

function WeatherApp() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState('');
  const [lat, setLat] = useState(null);
  const [lon, setLon] = useState(null);
  const [loading, setLoading] = useState(false);
  const [unit, setUnit] = useState('imperial');

  // Fix for default marker icon issue with Leaflet in React
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
  });

  const handleChange = (e) => {
    setCity(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const apiKey = process.env.REACT_APP_API_KEY;
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${unit}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.cod === 200) {
        setWeather(data);
        setLat(data.coord.lat);
        setLon(data.coord.lon);
      } else {
        setWeather(null);
        setLat(null); // Reset latitude
        setLon(null); // Reset longitude
        setError(data.message);
      }
    } catch (err) {
      setWeather(null);
      setLat(null); // Reset latitude
      setLon(null); // Reset longitude
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const getBackgroundClass = (weatherCondition) => {
    switch (weatherCondition.toLowerCase()) {
      case 'clear':
        return 'bg-gradient-to-br from-yellow-200 to-orange-200';
      case 'rain':
        return 'bg-gradient-to-br from-blue-400 to-gray-400';
      case 'clouds':
        return 'bg-gradient-to-br from-gray-300 to-gray-500';
      default:
        return 'bg-gradient-to-br from-blue-50 to-blue-100';
    }
  };

  const getWeatherIcon = (weatherCondition) => {
    switch (weatherCondition.toLowerCase()) {
      case 'clear':
        return <FaSun className="text-yellow-500 text-6xl" />;
      case 'rain':
        return <FaCloudRain className="text-blue-500 text-6xl" />;
      case 'clouds':
        return <FaCloud className="text-gray-500 text-6xl" />;
      case 'snow':
        return <FaSnowflake className="text-blue-300 text-6xl" />;
      default:
        return <FaSun className="text-yellow-500 text-6xl" />;
    }
  };

  useEffect(() => {
    if (lat && lon && weather) { // Add a check for `weather`
      const mapContainer = document.getElementById('map');
      if (mapContainer) {
        mapContainer.innerHTML = '';
      }

      const map = L.map('map').setView([lat, lon], 10);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      const layers = {
        'Temperature': L.tileLayer(
          `https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=d4e9b9b1dc2334203a4091f62297d8b6`
        ),
        'Precipitation': L.tileLayer(
          `https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=d4e9b9b1dc2334203a4091f62297d8b6`
        ),
        'Clouds': L.tileLayer(
          `https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=d4e9b9b1dc2334203a4091f62297d8b6`
        ),
        'Pressure': L.tileLayer(
          `https://tile.openweathermap.org/map/pressure_new/{z}/{x}/{y}.png?appid=d4e9b9b1dc2334203a4091f62297d8b6`
        ),
        'Wind': L.tileLayer(
          `https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=d4e9b9b1dc2334203a4091f62297d8b6`
        )
      };

      const layerControl = L.control.layers(
        { 'Base Map': L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png') },
        layers
      ).addTo(map);

      L.marker([lat, lon]).addTo(map)
        .bindPopup(weather.name)
        .openPopup();

      map.invalidateSize();

      return () => {
        map.remove();
      };
    }
  }, [lat, lon, weather]);

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${getBackgroundClass(weather?.weather[0]?.main || 'default')}`}>
      <h1 className="text-4xl font-semibold text-center text-gray-700 mb-4">Weather App</h1>
      <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-4">
        <input
          type="text"
          value={city}
          onChange={handleChange}
          placeholder="Enter city"
          className="p-2 rounded-lg border border-gray-300 shadow-md w-64 text-lg"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 w-32"
        >
          Get Weather
        </button>
      </form>

      {loading && (
        <div className="mt-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}

      {error && (
        <p className="text-red-500 text-xl mt-4">
          {error === 'city not found' ? 'City not found. Please try again.' : error}
        </p>
      )}

      {weather && (
        <div className="mt-6 p-6 bg-white rounded-lg shadow-md text-center w-80">
          <h2 className="text-2xl font-bold text-gray-800">{weather.name}</h2>
          <div className="my-4">
            {getWeatherIcon(weather.weather[0].main)}
          </div>
          <p className="text-xl text-gray-600">Temperature: {weather.main.temp}°{unit === 'imperial' ? 'F' : 'C'}</p>
          <p className="text-lg text-gray-500">Weather: {weather.weather[0].description}</p>
        </div>
      )}

      <div className="flex space-x-4 mt-4">
        <button
          onClick={() => setUnit('imperial')}
          className={`p-2 rounded-lg ${unit === 'imperial' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          °F
        </button>
        <button
          onClick={() => setUnit('metric')}
          className={`p-2 rounded-lg ${unit === 'metric' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          °C
        </button>
      </div>

      {lat && lon && weather && (
        <div id="map" style={{ width: '100%', height: '500px', marginTop: '20px' }}></div>
      )}
    </div>
  );
}

export default WeatherApp;