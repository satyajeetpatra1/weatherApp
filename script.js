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
