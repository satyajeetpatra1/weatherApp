// api key
const OPENWEATHER_API_KEY = "043d60d85a7c98befa07698cc4ba1640";

// api endpoints
const WEATHER_URL = "https://api.openweathermap.org/data/2.5/weather";
const GEOCODE_URL = "https://api.openweathermap.org/geo/1.0/direct";
const OPENWEATHER_ICON_URL = "https://openweathermap.org/img/wn";

// dom elements needed
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locBtn = document.getElementById("locBtn");
const recentSelect = document.getElementById("recentSelect");

const cToggle = document.getElementById("cToggle");
const fToggle = document.getElementById("fToggle");

const uiMessage = document.getElementById("uiMessage");
const customAlert = document.getElementById("customAlert");

const locationNameEl = document.getElementById("locationName");
const localTimeEl = document.getElementById("localTime");
const todayTempEl = document.getElementById("todayTemp");
const weatherDescEl = document.getElementById("weatherDesc");
const weatherIconEl = document.getElementById("weatherIcon");

const humidityEl = document.getElementById("humidity");
const windEl = document.getElementById("wind");
const pressureEl = document.getElementById("pressure");
const visibilityEl = document.getElementById("visibility");

const currentCard = document.getElementById("currentCard");

const forecastRow = document.getElementById("forecastRow"); // kept for layout balance

// variables
let recentCities = [];
let lastWeatherData = null;
let displayUnit = "C"; // default to Celsius



// functions

// alert and info
function showUIMessage(msg, type = "info") {
  uiMessage.textContent = msg;
  uiMessage.className =
    type === "error"
      ? "text-red-400 text-sm mt-2"
      : "text-slate-300 text-sm mt-2";
  if (msg) setTimeout(() => (uiMessage.textContent = ""), 4000);
}

function showCustomAlertText(text) {
  customAlert.textContent = text;
  customAlert.classList.remove("hidden");
  setTimeout(() => customAlert.classList.add("hidden"), 4000);
}

// format change functions
function cToF(c) {
  return (c * 9) / 5 + 32;
}

function formatTemp(tempC) {
  return displayUnit === "C"
    ? `${Math.round(tempC)}°C`
    : `${Math.round(cToF(tempC))}°F`;
}

function formatLocalTime(timezoneOffset) {
  const date = new Date(Date.now() + timezoneOffset * 1000);
  return date.toLocaleString(undefined, {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// save and show recent functions
function saveRecentCities() {
  localStorage.setItem("recentCities", JSON.stringify(recentCities));
}

function loadRecentCities() {
  recentCities = JSON.parse(localStorage.getItem("recentCities") || "[]");
  renderRecentSelect();
}

function addToRecentCities(city) {
  if (!city) return;
  city = city.trim();
  recentCities = recentCities.filter(
    (c) => c.toLowerCase() !== city.toLowerCase()
  );
  recentCities.unshift(city);
  if (recentCities.length > 5) recentCities.length = 5;
  saveRecentCities();
  renderRecentSelect();
}

function renderRecentSelect() {
  recentSelect.innerHTML = "";
  if (recentCities.length === 0) {
    recentSelect.innerHTML = `<option>— No recent cities —</option>`;
    return;
  }
  const defaultOpt = document.createElement("option");
  defaultOpt.textContent = "Select recent city...";
  defaultOpt.value = "";
  recentSelect.appendChild(defaultOpt);

  recentCities.forEach((city) => {
    const opt = document.createElement("option");
    opt.value = city;
    opt.className = "bg-slate-900";
    opt.textContent = city;
    recentSelect.appendChild(opt);
  });
}

// api calling functions
async function fetchJson(url) {
  const res = await fetch(url);
  return res.json();
}

// get latitude and longitude from city name
async function geocodeCity(city) {
  const url = `${GEOCODE_URL}?q=${encodeURIComponent(
    city
  )}&limit=1&appid=${OPENWEATHER_API_KEY}`;
  const data = await fetchJson(url);
  if (!data || data.length === 0) throw new Error("City not found");
  return {
    lat: data[0].lat,
    lon: data[0].lon,
    name: data[0].name,
    country: data[0].country,
  };
}

// get weather data from latitude and longitude
async function fetchWeatherByCoords(lat, lon) {
  const url = `${WEATHER_URL}?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHER_API_KEY}`;
  return fetchJson(url);
}

// first get latitude and longitude from city name and then get weather data using it
async function fetchWeatherByCity(city) {
  const geo = await geocodeCity(city);
  const data = await fetchWeatherByCoords(geo.lat, geo.lon);
  data.name = `${geo.name}, ${geo.country}`;
  return data;
}

// render weather data in dom
function renderWeather(data) {
  currentCard.classList.remove("hidden");
  lastWeatherData = data;
  const { name, sys, main, weather, wind, visibility, timezone } = data;

  locationNameEl.textContent = `${name || "Unknown"}, ${sys.country}`;
  localTimeEl.textContent = formatLocalTime(timezone);
  weatherDescEl.textContent = weather[0].description.toUpperCase();
  todayTempEl.textContent = formatTemp(main.temp);

  humidityEl.textContent = `${main.humidity}%`;
  windEl.textContent = `${wind.speed} m/s`;
  pressureEl.textContent = `${main.pressure} hPa`;
  visibilityEl.textContent = `${visibility} m`;

  const icon = weather[0].icon;
  weatherIconEl.innerHTML = `<img src="${OPENWEATHER_ICON_URL}/${icon}@2x.png" alt="weather icon" class="mx-auto" />`;

  // Dynamic background
  if (weather[0].main.toLowerCase().includes("rain")) {
    document.body.classList.add("bg-rainy");
  } else {
    document.body.classList.remove("bg-rainy");
  }

  // Custom alert for extreme temperatures
  if (main.temp >= 40) showCustomAlertText("🔥 Extreme Heat Alert!");
  if (main.temp <= 5) showCustomAlertText("❄️ Extreme Cold Alert!");

  // Clear forecast row (no extended forecast in current weather API)
  forecastRow.innerHTML = `
    <p class="text-slate-400 text-sm">No extended forecast available for this endpoint.</p>
  `;
}

// city search function
async function searchCity(city) {
  if (!city.trim()) {
    showUIMessage("Please enter a city name.", "error");
    return;
  }
  showUIMessage("Loading weather data...");
  try {
    const data = await fetchWeatherByCity(city);
    renderWeather(data);
    addToRecentCities(data.name);
    showUIMessage("Weather updated successfully!");
  } catch (err) {
    console.error(err);
    showUIMessage("Error fetching data. Please try again.", "error");
  }
}

// get weather data by accessing user location
async function useLocation() {
  if (!navigator.geolocation) {
    showUIMessage("Geolocation not supported.", "error");
    return;
  }
  showUIMessage("Fetching your location...");
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      try {
        const { latitude, longitude } = pos.coords;
        const data = await fetchWeatherByCoords(latitude, longitude);
        renderWeather(data);
        addToRecentCities(data.name);
        showUIMessage("Weather for your location loaded!");
      } catch (err) {
        console.error(err);
        showUIMessage("Error fetching weather for location.", "error");
      }
    },
    () => showUIMessage("Unable to access location.", "error")
  );
}