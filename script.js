// api key
const OPENWEATHER_API_KEY = "043d60d85a7c98befa07698cc4ba1640";

// api endpoints
const WEATHER_URL = "https://api.openweathermap.org/data/2.5/weather";
const GEOCODE_URL = "https://api.openweathermap.org/geo/1.0/direct";
const OPENWEATHER_ICON_URL = "https://openweathermap.org/img/wn";
const FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast";

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

const extendCollapseIcon = document.getElementById("extendCollapseIcon");
const forecastRow = document.getElementById("forecastRow");

// variables
let recentCities = [];
let lastWeatherData = null;
let lastForecastData = null;
let displayUnit = "C"; // default to Celsius
let isForecastExtended = false; //default collapsed

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

async function fetchForecastByCoords(lat, lon) {
  const url = `${FORECAST_URL}?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHER_API_KEY}`;
  return fetchJson(url);
}

async function fetchWeatherAndForecast(city) {
  const geo = await geocodeCity(city);
  const [weather, forecast] = await Promise.all([
    fetchWeatherByCoords(geo.lat, geo.lon),
    fetchForecastByCoords(geo.lat, geo.lon),
  ]);
  weather.name = `${geo.name}, ${geo.country}`;
  return { weather, forecast };
}

// render weather data in dom
function renderWeather(data) {
  currentCard.classList.remove("hidden");
  lastWeatherData = data;
  const { name, sys, main, weather, wind, visibility, timezone } = data;

  locationNameEl.textContent = `${name || "Unknown"}`;
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

  // Clear forecast row
  forecastRow.innerHTML = `
    <p class="text-slate-400 text-sm">No extended forecast available for this endpoint.</p>
  `;
}

function groupForecastByDay(forecastList) {
  const grouped = {};
  forecastList.forEach((item) => {
    const date = item.dt_txt.split(" ")[0];
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(item);
  });
  return Object.entries(grouped).slice(0, 5); // only next 5 days
}

function renderForecast(data) {
  lastForecastData = data;
  const grouped = groupForecastByDay(data.list);

  forecastRow.innerHTML = ""; // clear old

  grouped.forEach(([date, entries]) => {
    const temps = entries.map((e) => e.main.temp);
    const winds = entries.map((e) => e.wind.speed);
    const hums = entries.map((e) => e.main.humidity);
    const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;
    const avgWind = winds.reduce((a, b) => a + b, 0) / winds.length;
    const avgHum = hums.reduce((a, b) => a + b, 0) / hums.length;
    const icon = entries[0].weather[0].icon;
    const desc = entries[0].weather[0].description;

    const card = document.createElement("div");
    card.className =
      "bg-slate-800 p-4 rounded-2xl shadow-lg text-center flex flex-col gap-2";
    card.innerHTML = `
      <p class="text-slate-300 font-semibold">${new Date(
        date
      ).toDateString()}</p>
      <img src="${OPENWEATHER_ICON_URL}/${icon}.png" alt="${desc}" class="w-12 h-12 mx-auto" />
      <p class="text-lg text-white font-bold">${formatTemp(avgTemp)}</p>
      <p class="text-slate-400 text-sm">${desc}</p>
      <div class="text-slate-400 text-xs">
        <p>💨 ${avgWind.toFixed(1)} m/s</p>
        <p>💧 ${avgHum.toFixed(0)}%</p>
      </div>
    `;
    forecastRow.appendChild(card);
  });
}

// city search function
async function searchCity(city) {
  if (!city.trim()) {
    showUIMessage("Please enter a city name.", "error");
    return;
  }
  showUIMessage("Loading weather data...");
  try {
    const { weather, forecast } = await fetchWeatherAndForecast(city);
    renderWeather(weather);
    renderForecast(forecast);
    addToRecentCities(weather.name);
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
        const [weather, forecast] = await Promise.all([
          fetchWeatherByCoords(latitude, longitude),
          fetchForecastByCoords(latitude, longitude),
        ]);
        renderWeather(weather);
        renderForecast(forecast);
        addToRecentCities(weather.name);
        showUIMessage("Weather for your location loaded!");
      } catch (err) {
        console.error(err);
        showUIMessage("Error fetching weather for location.", "error");
      }
    },
    () => showUIMessage("Unable to access location.", "error")
  );
}

// event listeners required
searchBtn.addEventListener("click", () => searchCity(cityInput.value));

cityInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") searchCity(cityInput.value);
});

locBtn.addEventListener("click", useLocation);

recentSelect.addEventListener("change", () => {
  const city = recentSelect.value;
  if (city) searchCity(city);
});

cToggle.addEventListener("click", () => {
  displayUnit = "C";
  fToggle.className = "px-3 py-1 rounded bg-transparent border border-white/6";
  cToggle.className = "px-3 py-1 rounded bg-white/6";
  if (lastWeatherData) renderWeather(lastWeatherData);
  if (lastForecastData) renderForecast(lastForecastData);
});

fToggle.addEventListener("click", () => {
  displayUnit = "F";
  cToggle.className = "px-3 py-1 rounded bg-transparent border border-white/6";
  fToggle.className = "px-3 py-1 rounded bg-white/6";
  if (lastWeatherData) renderWeather(lastWeatherData);
  if (lastForecastData) renderForecast(lastForecastData);
});

extendCollapseIcon.addEventListener("click", () => {
  isForecastExtended = !isForecastExtended;
  if (isForecastExtended) {
    extendCollapseIcon.innerHTML = `<span class="material-symbols-outlined">
            expand_circle_up
        </span>`;

    forecastRow.classList.remove("hidden");
    forecastRow.classList.add("grid");
  } else {
    extendCollapseIcon.innerHTML = `<span class="material-symbols-outlined">
            expand_circle_down
        </span>`;

    forecastRow.classList.remove("grid");
    forecastRow.classList.add("hidden");
  }
});

document.addEventListener("DOMContentLoaded", () => {
  loadRecentCities();
  showUIMessage("Ready — search a city or use location.");
});
