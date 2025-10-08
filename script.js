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