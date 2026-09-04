let chart1;
let chartLow;
let chartMid;
let chartHigh;
let currentMountain = null;
let currentModel = "jma_seamless";
let scrollSynced = false;

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

  const res = await fetch(url);
  const data = await res.json();
  const h = data.hourly;

  const modelName = currentModel === "jma_seamless" ? "JMA" : "ECMWF";
  const title = m.name + "　緯度:" + m.lat + " 経度:" + m.lon + "　【" + modelName + "】";
  document.getElementById("title1").textContent = title;

  buildStrip(h);

  const labels = h.time.map(t => fmtDate(t) + " " + fmtHour(t) + "時");

  await drawChart1(labels, h.cloudcover, h.precipitation);
  await drawCloud("chartLow", labels, h.cloudcover_low, "下層雲量（%）", "#e91e8c");
  await drawCloud("chartMid", labels, h.cloudcover_mid, "中層雲量（%）", "#2196f3");
  await drawCloud("chartHigh", labels, h.cloudcover_high, "上層雲量（%）", "#4caf50");

  if (!scrollSynced) {
    syncScroll();
    scrollSynced = true;
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

function drawChart1(labels, cloud, precip) {
  if (chart1) chart1.destroy();
  chart1 = new Chart(document.getElementById("chart1"), {
    data: {
      labels,
      datasets: [
        { type: "line", label: "雲量（%）", data: cloud, yAxisID: "y", borderColor: "#999", backgroundColor: "rgba(180,180,180,0.4)", fill: true, pointRadius: 0, tension: 0.3 },
        { type: "bar", label: "降水量（mm）", data: precip, yAxisID: "y1", backgroundColor: "#3399dd" }
      ]
    },
    options: {
      responsive: true,
      interaction: { mode: "index", intersect: false },
      scales: {
        y: {
          position: "left",
          min: 0,
          max: 100,
          title: { display: false },
          ticks: { display: false }
        },
        y1: {
          position: "right",
          min: 0,
          grid: { drawOnChartArea: false },
          title: { display: false },
          ticks: { display: false }
        }
      }
    }
  });
}
async function drawCloud(canvasId, labels, data, label, color) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  if (canvasId === "chartLow") {
    if (chartLow) chartLow.destroy();
    chartLow = new Chart(canvas, {
      type: "line",
      data: { labels, datasets: [{ label, data, borderColor: color, backgroundColor: color + "33", fill: true, pointRadius: 0, tension: 0.3 }] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        scales: { y: { min: 0, max: 100, title: { display: true, text: "雲量（%）" } } }
      }
    });
  } else if (canvasId === "chartMid") {
    if (chartMid) chartMid.destroy();
    chartMid = new Chart(canvas, {
      type: "line",
      data: { labels, datasets: [{ label, data, borderColor: color, backgroundColor: color + "33", fill: true, pointRadius: 0, tension: 0.3 }] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        scales: { y: { min: 0, max: 100, title: { display: true, text: "雲量（%）" } } }
      }
    });
  } else if (canvasId === "chartHigh") {
    if (chartHigh) chartHigh.destroy();
    chartHigh = new Chart(canvas, {
      type: "line",
      data: { labels, datasets: [{ label, data, borderColor: color, backgroundColor: color + "33", fill: true, pointRadius: 0, tension: 0.3 }] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        scales: { y: { min: 0, max: 100, title: { display: true, text: "雲量（%）" } } }
      }
    });
  }
}

function syncScroll() {
  const scrollWrapper = document.querySelector(".unified-scroll-wrapper");
  const graphScroll = document.querySelector(".graph-scroll");

  if (!scrollWrapper || !graphScroll) return;

  let isSyncing = false;

  scrollWrapper.addEventListener("scroll", () => {
    if (isSyncing) return;
    isSyncing = true;
    graphScroll.scrollLeft = scrollWrapper.scrollLeft;
    setTimeout(() => { isSyncing = false; }, 50);
  });

  graphScroll.addEventListener("scroll", () => {
    if (isSyncing) return;
    isSyncing = true;
    scrollWrapper.scrollLeft = graphScroll.scrollLeft;
    setTimeout(() => { isSyncing = false; }, 50);
  });
}

loadMountains();
