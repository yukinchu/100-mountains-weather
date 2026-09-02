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
    setupScroll();
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
    else { if (hour % 6 !== 0) continue; }

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

function drawAllCharts(h) {
  const labels = h.time.map(t => fmtDate(t) + " " + fmtHour(t) + "時");
  
  drawChart1(labels, h.cloudcover, h.precipitation);
  drawCloudChart("chartLow", labels, h.cloudcover_low, "下層雲量（%）", "#e91e8c");
  drawCloudChart("chartMid", labels, h.cloudcover_mid, "中層雲量（%）", "#2196f3");
  drawCloudChart("chartHigh", labels, h.cloudcover_high, "上層雲量（%）", "#4caf50");
}

function drawChart1(labels, cloud, precip) {
  if (chart1) chart1.destroy();
  
  const ctx = document.getElementById("chart1");
  if (!ctx) {
    console.error("chart1 canvas not found");
    return;
  }
  
  chart1 = new Chart(ctx, {
    data: {
      labels,
      datasets: [
        { 
          type: "line", 
          label: "雲量（%）", 
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
          label: "降水量（mm）", 
          data: precip, 
          yAxisID: "y1", 
          backgroundColor: "#3399dd" 
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      scales: {
        y: { position: "left", min: 0, max: 100, title: { display: true, text: "雲量（%）" } },
        y1: { position: "right", min: 0, grid: { drawOnChartArea: false }, title: { display: true, text: "降水量（mm）" } }
      }
    }
  });
}

function drawCloudChart(canvasId, labels, data, label, color) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) {
    console.error(canvasId + " canvas not found");
    return;
  }

  let chartVar;
  if (canvasId === "chartLow") {
    if (chartLow) chartLow.destroy();
    chartVar = chartLow;
  } else if (canvasId === "chartMid") {
    if (chartMid) chartMid.destroy();
    chartVar = chartMid;
  } else if (canvasId === "chartHigh") {
    if (chartHigh) chartHigh.destroy();
    chartVar = chartHigh;
  }

  const newChart = new Chart(ctx, {
    type: "line",
    data: { 
      labels, 
      datasets: [ 
        { 
          label, 
          data, 
          borderColor: color, 
          backgroundColor: color + "33", 
          fill: true, 
          pointRadius: 0, 
          tension: 0.3 
        } 
      ] 
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      scales: { 
        y: { min: 0, max: 100, title: { display: true, text: "雲量（%）" } } 
      }
    }
  });

  if (canvasId === "chartLow") {
    chartLow = newChart;
  } else if (canvasId === "chartMid") {
    chartMid = newChart;
  } else if (canvasId === "chartHigh") {
    chartHigh = newChart;
  }
}

function setupScroll() {
  const scrollWrapper = document.querySelector(".unified-scroll-wrapper");
  const graphScroll = document.getElementById("graphScroll");
  
  if (!scrollWrapper || !graphScroll) {
    console.warn("Scroll elements not found");
    return;
  }
  
  scrollWrapper.removeEventListener("scroll", onScrollWrapper);
  graphScroll.removeEventListener("scroll", onScrollGraph);
  
  scrollWrapper.addEventListener("scroll", onScrollWrapper);
  graphScroll.addEventListener("scroll", onScrollGraph);
}

function onScrollWrapper(e) {
  const graphScroll = document.getElementById("graphScroll");
  if (graphScroll) {
    graphScroll.scrollLeft = e.target.scrollLeft;
  }
}

function onScrollGraph(e) {
  const scrollWrapper = document.querySelector(".unified-scroll-wrapper");
  if (scrollWrapper) {
    scrollWrapper.scrollLeft = e.target.scrollLeft;
  }
}

loadMountains();
