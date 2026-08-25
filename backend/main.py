from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import requests

app = FastAPI(title="Weather System API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

WEATHER_CONDITIONS = {
    0: ("Clear Sky", "☀️"),
    1: ("Mainly Clear", "🌤️"),
    2: ("Partly Cloudy", "⛅"),
    3: ("Overcast", "☁️"),
    45: ("Foggy", "🌫️"),
    48: ("Foggy", "🌫️"),
    51: ("Light Drizzle", "🌦️"),
    53: ("Drizzle", "🌦️"),
    55: ("Heavy Drizzle", "🌧️"),
    61: ("Light Rain", "🌦️"),
    63: ("Rain", "🌧️"),
    65: ("Heavy Rain", "🌧️"),
    71: ("Light Snow", "🌨️"),
    73: ("Snow", "❄️"),
    75: ("Heavy Snow", "❄️"),
    80: ("Rain Showers", "🌦️"),
    81: ("Rain Showers", "🌧️"),
    82: ("Heavy Rain Showers", "🌧️"),
    95: ("Thunderstorm", "⛈️"),
    96: ("Thunderstorm", "⛈️"),
    99: ("Thunderstorm", "⛈️"),
}


@app.get("/")
def home():
    return {
        "message": "Weather System API is running successfully!"
    }


@app.get("/weather")
def get_weather(city: str = Query(..., min_length=1)):

    geocoding_url = "https://geocoding-api.open-meteo.com/v1/search"

    geocoding_params = {
        "name": city,
        "count": 1,
        "language": "en",
        "format": "json"
    }

    geo_response = requests.get(
        geocoding_url,
        params=geocoding_params,
        timeout=10
    )

    if geo_response.status_code != 200:
        raise HTTPException(
            status_code=502,
            detail="Unable to find the city."
        )

    geo_data = geo_response.json()

    if "results" not in geo_data or not geo_data["results"]:
        raise HTTPException(
            status_code=404,
            detail="City not found."
        )

    location = geo_data["results"][0]

    latitude = location["latitude"]
    longitude = location["longitude"]

    weather_url = "https://api.open-meteo.com/v1/forecast"

    weather_params = {
        "latitude": latitude,
        "longitude": longitude,
        "current": (
            "temperature_2m,"
            "relative_humidity_2m,"
            "apparent_temperature,"
            "weather_code,"
            "wind_speed_10m,"
            "surface_pressure,"
            "visibility"

        ),
        "daily": (
            "weather_code,"
            "temperature_2m_max,"
            "temperature_2m_min,"
            "sunrise,"
            "sunset"
        ),
        "forecast_days": 5,
        "timezone": "auto"
    }

    weather_response = requests.get(
        weather_url,
        params=weather_params,
        timeout=10
    )

    if weather_response.status_code != 200:
        raise HTTPException(
            status_code=502,
            detail="Unable to get weather data."
        )

    weather_data = weather_response.json()

    current = weather_data["current"]
    daily = weather_data["daily"]

    weather_code = current["weather_code"]

    condition, icon = WEATHER_CONDITIONS.get(
        weather_code,
        ("Unknown", "🌡️")
    )

    forecast = []

    for i in range(len(daily["time"])):
        code = daily["weather_code"][i]

        day_condition, day_icon = WEATHER_CONDITIONS.get(
            code,
            ("Unknown", "🌡️")
        )

        forecast.append({
            "date": daily["time"][i],
            "condition": day_condition,
            "icon": day_icon,
            "max_temperature": daily["temperature_2m_max"][i],
            "min_temperature": daily["temperature_2m_min"][i]
        })

    return {
        "city": location["name"],
        "country": location.get("country", ""),
        "temperature": current["temperature_2m"],
        "condition": condition,
        "icon": icon,
        "humidity": current["relative_humidity_2m"],
        "wind_speed": current["wind_speed_10m"],
        "feels_like": current["apparent_temperature"],
        "pressure": current["surface_pressure"],
        "visibility": current["visibility"],
        "sunrise": daily["sunrise"][0],
        "sunset": daily["sunset"][0],
        "forecast": forecast
    }


@app.get("/weather-by-location")
def get_weather_by_location(
    latitude: float,
    longitude: float
):

    weather_url = "https://api.open-meteo.com/v1/forecast"

    weather_params = {
        "latitude": latitude,
        "longitude": longitude,
        "current": (
            "temperature_2m,"
            "relative_humidity_2m,"
            "apparent_temperature,"
            "weather_code,"
            "wind_speed_10m,"
            "surface_pressure,"
            "visibility"
        ),
        "daily": (
            "weather_code,"
            "temperature_2m_max,"
            "temperature_2m_min,"
            "sunrise,"
            "sunset"
        ),
        "forecast_days": 5,
        "timezone": "auto"
    }

    response = requests.get(
        weather_url,
        params=weather_params,
        timeout=10
    )

    if response.status_code != 200:
        raise HTTPException(
            status_code=502,
            detail="Unable to get weather data."
        )

    data = response.json()

    current = data["current"]
    daily = data["daily"]

    weather_code = current["weather_code"]

    condition, icon = WEATHER_CONDITIONS.get(
        weather_code,
        ("Unknown", "🌡️")
    )

    forecast = []

    for i in range(len(daily["time"])):
        code = daily["weather_code"][i]

        day_condition, day_icon = WEATHER_CONDITIONS.get(
            code,
            ("Unknown", "🌡️")
        )

        forecast.append({
            "date": daily["time"][i],
            "condition": day_condition,
            "icon": day_icon,
            "max_temperature": daily["temperature_2m_max"][i],
            "min_temperature": daily["temperature_2m_min"][i]
        })

    return {
        "city": "Your Location",
        "country": "",
        "temperature": current["temperature_2m"],
        "condition": condition,
        "icon": icon,
        "humidity": current["relative_humidity_2m"],
        "wind_speed": current["wind_speed_10m"],
        "feels_like": current["apparent_temperature"],
        "pressure": current["surface_pressure"],
        "visibility": current["visibility"],
        "sunrise": daily["sunrise"][0],
        "sunset": daily["sunset"][0],
        "forecast": forecast
    }