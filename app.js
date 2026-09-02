let chart1;
let chartLow;
let chartMid;
let chartHigh;
let currentMountain = null;
let currentModel = "jma_seamless";

function fmtDate(t) {
  const m = parseInt(t.slice(5, 7), 10);
  const d = parseInt(t.slice(8, 10), 10);
  return m + "/" + d;
}

function fmtHour(t) { 
  return parseInt(t.slice(11, 13), 10); 
}

function weatherIcon(code) {
  if (code === 0) return "☀️";
  if (code <= 2) return "🌤️";
  if (code === 3) return "☁️";
  if (code >= 45 && code <= 48) return "🌫️";
  if (code >= 51 && code <= 67) return "🌧️";
  if (code >= 71 && code <= 77) return "❄️";
  if (code >= 80 && code <= 82) return "🌧️";
  if (code >= 85 && code <= 86) return "❄️";
  if (code >= 95) return "⛈️";
  return "☁️";
}

async function loadMountains() {
  const res = await fetch("mountains.json");
  const mountains = await res.json();
  const select = document.getElementById("mountainSelect");
  
  mountains.forEach((m, i) => {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = m.name;
    select.appendChild(opt);
  });
  
  select.addEventListener("change", () => {
    currentMountain = mountains[select.value];
    showWeather();
  });
  
  document.getElementById("btnJMA").addEventListener("click", () => setModel("jma_seamless", "btnJMA"));
  document.getElementById("btnECMWF").addEventListener("click", () => setModel("ecmwf_ifs025", "btnECMWF"));
  
  if (mountains.length > 0) { 
    currentMountain = mountains[0]; 
    showWeather(); 
  }
}

function setModel(model, btnId) {
  currentModel = model;
  document.getElementById("btnJMA").classList.remove("active");
  document.getElementById("btnECMWF").classList.remove("active");
  document.getElementById(btnId).classList.add("active");
  showWeather();
}

async function showWeather() {
  const m = currentMountain;
  if (!m) return;

  const url = "https://api.open-meteo.com/v1/forecast"
    + "?latitude=" + m.lat
    + "&longitude=" + m.lon
    + "&hourly=temperature_2m,precipitation,precipitation_probability,relativehumidity_2m,weathercode,windspeed_10m,cloudcover,cloudcover_low,cloudcover_mid,cloudcover_high"
    + "&models=" + currentModel
    + "&timezone=Asia%2FTokyo";

  try {
    const res = await fetch(url);
    const data = await res.json();
    const h = data.hourly;

    const modelName = currentModel === "jma_seamless" ? "JMA" : "ECMWF";
    const title = m.name + "　緯度:" + m.lat + " 経度:" + m.lon + "　【" + modelName + "】";
    document.getElementById("title1").textContent = title;

    buildStrip(h);
    drawAllCharts(h);
    
    setTimeout(() => {
      setupScroll();
    }, 100);
  } catch (error) {
    console.error("Error fetching weather data:", error);
  }
}

function buildStrip(h) {
  const strip = document.getElementById("weatherStrip");
  strip.innerHTML = "";
  const baseTime = new Date(h.time[0]);
  let cells = "";

  for (let i = 0; i < h.time.length; i++) {
    const hour = fmtHour(h.time[i]);
    const t = new Date(h.time[i]);
    const dayDiff = Math.floor((t - baseTime) / (1000 * 60 * 60 * 24));

    if (dayDiff <= 1) { if (hour % 3 !== 0) continue; }
    else { if (hour %
