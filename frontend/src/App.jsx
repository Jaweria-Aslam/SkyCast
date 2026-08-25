import { useState } from "react";
import "./App.css";

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [unit, setUnit] = useState("C");
  const [darkMode, setDarkMode] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [lastUpdated, setLastUpdated] = useState("");
  const [assistantQuestion, setAssistantQuestion] = useState("");
  const [assistantAnswer, setAssistantAnswer] = useState("");

  const searchWeather = async () => {
    if (!city.trim()) {
      setError("Please enter a city name.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `http://127.0.0.1:8000/weather?city=${encodeURIComponent(city)}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unable to get weather.");
      }

      setWeather(data);
      setLastUpdated(
        new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
         })
      );
      setSearchHistory((prev) => {
        const updated = [
          city.trim(),
          ...prev.filter(
            (item) => item.toLowerCase() !== city.trim().toLowerCase()
          ),
        ];

        return updated.slice(0, 5);
       });
    } catch (error) {
      setWeather(null);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setError("Location is not supported by your browser.");
      return;
    }

    setLoading(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const response = await fetch(
            `http://127.0.0.1:8000/weather-by-location?latitude=${latitude}&longitude=${longitude}`
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.detail || "Unable to get weather.");
          }

          setWeather(data);
          setLastUpdated(
            new Date().toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
             })
          );
          setCity(data.city);
        } catch (error) {
          setWeather(null);
          setError(error.message);
        } finally {
          setLoading(false);
        }
      },
      () => {
        setLoading(false);
        setError("Please allow location access to use this feature.");
      }
    );
  };

  const convertTemperature = (temperature) => {
    if (unit === "C") {
      return Math.round(temperature);
    }

    return Math.round((temperature * 9) / 5 + 32);
  };
  const getWeatherClass = (condition) => {
  const text = condition.toLowerCase();

  if (text.includes("rain") || text.includes("drizzle")) {
    return "rainy";
  }

  if (text.includes("thunderstorm")) {
    return "stormy";
  }

  if (
    text.includes("cloud") ||
    text.includes("overcast") ||
    text.includes("fog")
  ) {
    return "cloudy";
  }

  if (text.includes("snow")) {
    return "snowy";
  }

  return "sunny";
};
const getWeatherAdvice = (question) => {
  if (!weather) return "Please search for a city first.";

  const text = question.toLowerCase();
  const condition = weather.condition.toLowerCase();
  const temperature = weather.temperature;

  if (
    text.includes("umbrella") ||
    text.includes("rain") ||
    text.includes("barish")
  ) {
    if (
      condition.includes("rain") ||
      condition.includes("drizzle") ||
      condition.includes("thunderstorm")
    ) {
      return `🌧️ Yes, you should carry an umbrella in ${weather.city}. Rainy weather is currently expected.`;
    }

    return `☀️ An umbrella may not be necessary right now in ${weather.city}, but you can check the 5-day forecast for upcoming rain.`;
  }

  if (
    text.includes("hot") ||
    text.includes("garmi") ||
    text.includes("temperature")
  ) {
    return `🌡️ The current temperature in ${weather.city} is ${Math.round(
      temperature
    )}°C, with ${weather.condition.toLowerCase()} conditions.`;
  }

  if (
    text.includes("cold") ||
    text.includes("sardi")
  ) {
    return `🥶 The current temperature in ${weather.city} is ${Math.round(
      temperature
    )}°C. ${temperature <= 15 ? "Warm clothes are recommended." : "The weather is not very cold."}`;
  }

  if (
    text.includes("outdoor") ||
    text.includes("outside") ||
    text.includes("bahar")
  ) {
    if (
      condition.includes("rain") ||
      condition.includes("storm") ||
      condition.includes("snow")
    ) {
      return `⚠️ Outdoor activities may not be ideal in ${weather.city} because the current condition is ${weather.condition.toLowerCase()}.`;
    }

    return `🌤️ The weather in ${weather.city} looks suitable for outdoor activities.`;
  }

  if (
    text.includes("weather") ||
    text.includes("mausam")
  ) {
    return `🌤️ ${weather.city} currently has ${weather.condition.toLowerCase()} conditions with a temperature of ${Math.round(
      temperature
    )}°C, humidity of ${weather.humidity}%, and wind speed of ${weather.wind_speed} km/h.`;
  }

  return `🤖 I can help you with weather questions about ${weather.city}, such as "Should I carry an umbrella?", "Is it hot?", or "Can I go outside?"`;
};

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateTime) => {
    return new Date(dateTime).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className={`weather-app ${
      darkMode ? "dark-mode" : ""
      } ${weather ? getWeatherClass(weather.condition) : ""}`}
> <div className={`weather-container ${darkMode ? "dark-mode" : ""}`}>

        <header className="header">

          <div className="brand">
            <span className="brand-icon">🌤️</span>
            <span>SkyCast</span>
          </div>

          <button
            className="theme-button"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>

          <h1>Weather at a Glance</h1>

          <p>
            Get accurate weather information for any city.
          </p>

        </header>

        <div className="search-box">

          <input
            type="text"
            placeholder="Search city..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                searchWeather();
              }
            }}
          />

          <button
            onClick={searchWeather}
            disabled={loading}
          >
            {loading ? "Searching..." : "Search"}
          </button>

          <button
            className="location-button"
            onClick={useMyLocation}
            disabled={loading}
          >
            {loading ? "Getting Location..." : "📍 My Location"}
          </button>
        </div>
        {searchHistory.length > 0 && (
          <div className="search-history">
            <span>Recent:</span>

            {searchHistory.map((item) => (
              <button
                key={item}
                onClick={() => {
                  setCity(item);
                  setTimeout(() => {
                    searchWeather();
                  }, 0);
               }}
              >
               {item}
             </button>
           ))}
         </div>
       )}

        <div className="unit-toggle">

          <button
            className={unit === "C" ? "active-unit" : ""}
            onClick={() => setUnit("C")}
          >
            °C
          </button>

          <button
            className={unit === "F" ? "active-unit" : ""}
            onClick={() => setUnit("F")}
          >
            °F
          </button>

        </div>

        {loading && (
          <div className="message">
            Loading weather...
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {weather && !loading && (
          <>
          {lastUpdated && (
            <div className="last-updated">
              🕒 Last updated at {lastUpdated}
            </div>
          )}
            <section className="current-weather">

              <div className="location">

                <h2>
                  {weather.city}, {weather.country}
                </h2>

                <p>
                  Current Weather
                </p>

              </div>

              <div className="main-weather">

                <div className="weather-icon">
                  {weather.icon}
                </div>

                <div>

                  <div className="temperature">
                    {convertTemperature(weather.temperature)}°{unit}
                  </div>

                  <div className="condition">
                    {weather.condition}
                  </div>

                </div>

              </div>

              <div className="weather-details">

                <div className="detail">

                  <span>💧</span>

                  <p>
                    Humidity
                  </p>

                  <strong>
                    {weather.humidity}%
                  </strong>

                </div>

                <div className="detail">

                  <span>💨</span>

                  <p>
                    Wind
                  </p>

                  <strong>
                    {weather.wind_speed} km/h
                  </strong>

                </div>

                <div className="detail">

                  <span>🌡️</span>

                  <p>
                    Feels Like
                  </p>

                  <strong>
                    {convertTemperature(weather.feels_like)}°{unit}
                  </strong>

                </div>
                <div className="detail">
                  <span>🌬️</span>
                  <p>Pressure</p>
                  <strong>
                    {Math.round(weather.pressure)} hPa
                  </strong>
                </div>

                <div className="detail">
                  <span>👁️</span>
                  <p>Visibility</p>
                  <strong>
                    {(weather.visibility / 1000).toFixed(1)} km
                  </strong>
                </div>

              </div>

              <div className="sun-info">

                <div>

                  <span>🌅</span>

                  <p>
                    Sunrise
                  </p>

                  <strong>
                    {formatTime(weather.sunrise)}
                  </strong>

                </div>

                <div>

                  <span>🌇</span>

                  <p>
                    Sunset
                  </p>

                  <strong>
                    {formatTime(weather.sunset)}
                  </strong>

                </div>

              </div>
             </section>

            <section className="weather-assistant">
  <h2>🤖 SkyCast Weather Assistant</h2>

  <p>
    Ask me anything about the current weather.
  </p>
  <div className="quick-questions">
  <button
    onClick={() => {
      setAssistantQuestion("Should I carry an umbrella?");
      setAssistantAnswer(
        getWeatherAdvice("Should I carry an umbrella?")
      );
    }}
  >
    ☔ Umbrella?
  </button>

  <button
    onClick={() => {
      setAssistantQuestion("Is it hot?");
      setAssistantAnswer(
        getWeatherAdvice("Is it hot?")
      );
    }}
  >
    🌡️ Is it hot?
  </button>

  <button
    onClick={() => {
      setAssistantQuestion("Can I go outside?");
      setAssistantAnswer(
        getWeatherAdvice("Can I go outside?")
      );
    }}
  >
    🌤️ Go outside?
  </button>
</div>

  <div className="assistant-input">
    <input
      type="text"
      placeholder="Ask: Should I carry an umbrella?"
      value={assistantQuestion}
      onChange={(e) => setAssistantQuestion(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter" && assistantQuestion.trim()) {
          setAssistantAnswer(getWeatherAdvice(assistantQuestion));
        }
      }}
    />

    <button
      onClick={() => {
        if (assistantQuestion.trim()) {
          setAssistantAnswer(getWeatherAdvice(assistantQuestion));
        }
      }}
    >
      Ask
    </button>
  </div>

  {assistantAnswer && (
    <div className="assistant-answer">
      {assistantAnswer}
    </div>
  )}
</section>
            

            <section className="forecast">

              <h2>
                5-Day Forecast
              </h2>

              <div className="forecast-grid">

                {weather.forecast.map((day) => (

                  <div
                    className="forecast-card"
                    key={day.date}
                  >

                    <p className="forecast-date">
                      {formatDate(day.date)}
                    </p>

                    <div className="forecast-icon">
                      {day.icon}
                    </div>

                    <p className="forecast-condition">
                      {day.condition}
                    </p>

                    <div className="forecast-temperature">

                      <strong>
                        {convertTemperature(day.max_temperature)}°{unit}
                      </strong>

                      <span>
                        {convertTemperature(day.min_temperature)}°{unit}
                      </span>

                    </div>

                  </div>

                ))}

              </div>

            </section>
          </>
        )}

      </div>
      <footer className="footer">
  <div className="footer-brand">
    🌤️ SkyCast
  </div>

  <p>
    A simple and modern weather dashboard built with React and FastAPI.
  </p>

  <div className="footer-info">
    <span>🌍 Real-time Weather</span>
    <span>📅 5-Day Forecast</span>
    <span>📍 Location Support</span>
  </div>

  <div className="footer-line"></div>

  <p className="footer-credit">
    © 2026 SkyCast. Built with React + FastAPI.
  </p>
</footer>
    </div>
  );
}

export default App;