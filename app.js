let chart1, chartLow, chartMid, chartHigh;
let currentMountain = null;
let currentModel = "jma_seamless";
const COL_WIDTH = 52;
const GRAPH_HEIGHT = 120;

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

function filterEvery3Hours(h) {
  const keys = [
    "time", "temperature_2m", "precipitation", "precipitation_probability",
    "relativehumidity_2m", "weathercode", "windspeed_10m",
    "cloudcover", "cloudcover_low", "cloudcover_mid", "cloudcover_high"
  ];
  const result = {};
  keys.forEach(k => result[k] = []);
  for (let i = 0; i < h.time.length; i++) {
    if (fmtHour(h.time[i]) % 3 !== 0) continue;
    keys.forEach(k => result[k].push(h[k] ? h[k][i] : null));
  }
  return result;
}

function adjustGraphSize(colCount) {
  const totalWidth = colCount * COL_WIDTH;
  const graphRows = document.getElementById("graphRows");
  if (graphRows) graphRows.style.width = totalWidth + "px";

  document.querySelectorAll(".graph-block").forEach(block => {
    block.style.width = totalWidth + "px";
  });

  ["chart1", "chartLow", "chartMid", "chartHigh"].forEach(id => {
    const cv = document.getElementById(id);
    if (cv) {
      cv.style.width = totalWidth + "px";
      cv.style.height = GRAPH_HEIGHT + "px";
      cv.width = totalWidth;
      cv.height = GRAPH_HEIGHT;
    }
  });
}

function buildStrip(h) {
  const strip = document.getElementById("weatherStrip");
  strip.innerHTML = "";
  let cells = "";
  const baseTime = new Date(h.time[0]);

  for (let i = 0; i < h.time.length; i++) {
    const hour = fmtHour(h.time[i]);
    const t = new Date(h.time[i]);
    const dayDiff = Math.floor((t - baseTime) / (1000 * 60 * 60 * 24));

    let cls = "conf-high";
    if (dayDiff >= 4) cls = "conf-low";
    else if (dayDiff >= 2) cls = "conf-mid";

    const showDate = (hour === 0 || i === 0) ? fmtDate(h.time[i]) : "";

    cells +=
      "<div class='ws-col " + cls + "'>"
      + "<div class='ws-date'>" + showDate + "</div>"
      + "<div class='ws-time'>" + hour + "時</div>"
      + "<div class='ws-icon'>" + weatherIcon(h.weathercode[i]) + "</div>"
      + "<div class='ws-val'>" + (h.precipitation_probability[i] ?? "-") + "%</div>"
      + "<div class='ws-val'>" + (h.precipitation[i] ?? 0) + "mm</div>"
      + "<div class='ws-val'>" + (h.relativehumidity_2m[i] ?? "-") + "%</div>"
      + "<div class='ws-val'>" + Math.round(h.temperature_2m[i]) + "℃</div>"
      + "<div class='ws-val'>" + Math.round(h.windspeed_10m[i]) + "m/s</div>"
      + "</div>";
  }
  strip.innerHTML = "<div class='ws-scroll'>" + cells + "</div>";
}

function makeChartOptions(hasY1) {
  const options = {
    responsive: false,
    maintainAspectRatio: false,
    animation: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: {
        ticks: {
          maxRotation: 90,
          minRotation: 90,
          font: { size: 10 },
          autoSkip: false
        }
      },
      y: {
        display: false,
        min: 0,
        max: 100
      }
    }
  };
  if (hasY1) {
    options.scales.y1 = {
      display: false,
      min: 0,
      position: "right",
      grid: { drawOnChartArea: false }
    };
  }
  return options;
}

function drawChart1(labels, cloud, precip) {
  if (chart1) { chart1.destroy(); chart1 = null; }
  const ctx = document.getElementById("chart1").getContext("2d");
  chart1 = new Chart(ctx, {
    data: {
      labels: labels,
      datasets: [
        {
          type: "line",
          label: "雲量",
          data: cloud,
          yAxisID: "y",
          borderColor: "#999",
          backgroundColor: "rgba(180,180,180,0.4)",
          fill: true,
          pointRadius: 0,
          tension: 0.3
        },
        {
          type: "bar",
          label: "降水量",
          data: precip,
          yAxisID: "y1",
          backgroundColor: "rgba(51,153,221,0.7)"
        }
      ]
    },
    options: makeChartOptions(true)
  });
}

function drawCloud(canvasId, labels, data, color) {
  if (canvasId === "chartLow"  && chartLow)  { chartLow.destroy();  chartLow  = null; }
  if (canvasId === "chartMid"  && chartMid)  { chartMid.destroy();  chartMid  = null; }
  if (canvasId === "chartHigh" && chartHigh) { chartHigh.destroy(); chartHigh = null; }

  const ctx = document.getElementById(canvasId).getContext("2d");
  const newChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "雲量",
          data: data,
          borderColor: color,
          backgroundColor: color + "55",
          fill: true,
          pointRadius: 0,
          tension: 0.3
        }
      ]
    },
    options: makeChartOptions(false)
  });

  if (canvasId === "chartLow")  chartLow  = newChart;
  if (canvasId === "chartMid")  chartMid  = newChart;
  if (canvasId === "chartHigh") chartHigh = newChart;
}

async function showWeather() {
  const m = currentMountain;
  if (!m) return;

  const url = "https://api.open-meteo.com/v1/forecast"
    + "?latitude=" + m.lat
    + "&longitude=" + m.lon
    + "&hourly=temperature_2m,precipitation,precipitation_probability,"
    + "relativehumidity_2m,weathercode,windspeed_10m,"
    + "cloudcover,cloudcover_low,cloudcover_mid,cloudcover_high"
    + "&models=" + currentModel
    + "&timezone=Asia%2FTokyo";

  const res = await fetch(url);
  const data = await res.json();
  const h = data.hourly;

  const modelName = currentModel === "jma_seamless" ? "JMA" : "ECMWF";
  document.getElementById("title1").textContent =
    m.name + "　緯度:" + m.lat + " 経度:" + m.lon + "　【" + modelName + "】";

  const filtered = filterEvery3Hours(h);
  buildStrip(filtered);

  const labels = filtered.time.map(t => fmtDate(t) + " " + fmtHour(t) + "時");

  adjustGraphSize(filtered.time.length);

  drawChart1(labels, filtered.cloudcover, filtered.precipitation);
  drawCloud("chartLow",  labels, filtered.cloudcover_low,  "#e91e8c");
  drawCloud("chartMid",  labels, filtered.cloudcover_mid,  "#2196f3");
  drawCloud("chartHigh", labels, filtered.cloudcover_high, "#4caf50");
}

function setModel(model, btnId) {
  currentModel = model;
  document.getElementById("btnJMA").classList.remove("active");
  document.getElementById("btnECMWF").classList.remove("active");
  document.getElementById(btnId).classList.add("active");
  showWeather();
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

loadMountains();
