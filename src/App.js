import React, { useState, useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

function WeatherApp() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState('');
  const [lat, setLat] = useState(null);
  const [lon, setLon] = useState(null);

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
    const apiKey = process.env.REACT_APP_API_KEY;  // Replace with your API key
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=imperial`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.cod === 200) {
        setWeather(data);
        setError('');
        setLat(data.coord.lat);  // Set latitude
        setLon(data.coord.lon);  // Set longitude
      } else {
        setWeather(null);
        setError(data.message);
      }
    } catch (err) {
      setWeather(null);
      setError('Failed to fetch data');
    }
  };

  useEffect(() => {
    if (lat && lon) {
      // Destroy existing map if it exists
      const mapContainer = document.getElementById('map');
      if (mapContainer) {
        mapContainer.innerHTML = '';
      }

      const map = L.map('map').setView([lat, lon], 10); // Set view to the city's coordinates

      // Base map layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      // OpenWeatherMap weather tile layers
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

      // Add layer control
      const layerControl = L.control.layers(
        { 'Base Map': L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png') },
        layers
      ).addTo(map);

      // Add marker for the city
      L.marker([lat, lon]).addTo(map)
        .bindPopup(weather.name)
        .openPopup();

      // Ensure map fits in container
      map.invalidateSize();

      // Cleanup function
      return () => {
        map.remove();
      };
    }
  }, [lat, lon, weather]);

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col items-center justify-center p-4">
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

      {error && <p className="text-red-500 text-xl mt-4">{error}</p>}
      
      {weather && (
        <div className="mt-6 p-6 bg-white rounded-lg shadow-md text-center w-80">
          <h2 className="text-2xl font-bold text-gray-800">{weather.name}</h2>
          <p className="text-xl text-gray-600">Temperature: {weather.main.temp}°F</p>
          <p className="text-lg text-gray-500">Weather: {weather.weather[0].description}</p>
        </div>
      )}

      {/* Map container */}
      {lat && lon && (
        <div id="map" style={{ width: '100%', height: '500px', marginTop: '20px' }}></div>
      )}
    </div>
  );
}

export default WeatherApp;