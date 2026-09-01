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
function fmtHour(t) { return parseInt(t.slice(11, 13), 10); }

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
  if (mountains.length > 0) { currentMountain = mountains[0]; showWeather(); }
}

function setModel(model, btnId) {
  currentModel = model;
  document.
