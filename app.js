let chart1, chart2, chart3;
let currentMountain = null;
let currentModel = "jma_seamless";

function fmtDate(t) {
  const m = parseInt(t.slice(5, 7), 10);
  const d = parseInt(t.slice(8, 10), 10);
  return m + "/" + d;
}
function fmtTime(t) {
  const hh = parseInt(t.slice(11, 13), 10);
  return hh + "時";
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

  const res = await fetch(url);
  const data = await res.json();
  const h = data.hourly;

  const modelName = currentModel === "jma_seamless" ? "JMA" : "ECMWF";
  const title = m.name + "　緯度:" + m.lat + " 経度:" + m.lon + "　【" + modelName + "】";
  document.getElementById("titleWeather").textContent = title + "（天気）";
  document.getElementById("title1").textContent = title;
  document.getElementById("title2").textContent = title;

  const labels = h.time.map(t => fmtDate(t) + " " + fmtTime(t));

    const strip = document.getElementById("weatherStrip");
  strip.innerHTML = "";

  const baseTime = new Date(h.time[0]);
  let lastDate = "";
  let cellsHtml = "";

  for (let i = 0; i < h.time.length; i++) {
    const t = new Date(h.time[i]);
    const dayDiff = Math.floor((t - baseTime) / (1000 * 60 * 60 * 24));
    const hour = t.getHours();

    // 1〜2日目は3時間おき、3日目以降は6時間おき
    if (dayDiff <= 1) {
      if (hour % 3 !== 0) continue;
    } else {
      if (hour % 6 !== 0) continue;
    }

    // 信頼度による背景クラス
    let relCls = "rel-high";
    if (dayDiff >= 4) relCls = "rel-low";
    else if (dayDiff >= 2) relCls = "rel-mid";

    const dateStr = fmtDate(h.time[i]);
    const showDate = (dateStr !== lastDate) ? dateStr : "";
    lastDate = dateStr;

    cellsHtml +=
      "<div class='wx-cell " + relCls + "'>"
      + "<div class='wx-date'>" + showDate + "</div>"
      + "<div class='wx-time'>" + fmtTime(h.time[i]) + "</div>"
      + "<div class='wx-icon'>" + weatherIcon(h.weathercode[i]) + "</div>"
      + "<div class='wx-pop'>" + (h.precipitation_probability[i] ?? 0) + "%</div>"
      + "<div class='wx-rain'>" + h.precipitation[i] + "mm</div>"
      + "<div class='wx-hum'>" + h.relativehumidity_2m[i] + "%</div>"
      + "<div class='wx-temp'>" + Math.round(h.temperature_2m[i]) + "℃</div>"
      + "<div class='wx-wind'>" + Math.round(h.windspeed_10m[i]) + "m/s</div>"
      + "</div>";
  }

  strip.innerHTML =
    "<div class='wx-labels'>"
    + "<div class='wx-date'>日付</div>"
    + "<div class='wx-time'>時刻</div>"
    + "<div class='wx-icon'>天気</div>"
    + "<div class='wx-pop'>降水%</div>"
    + "<div class='wx-rain'>雨量</div>"
    + "<div class='wx-hum'>湿度</div>"
    + "<div class='wx-temp'>気温</div>"
    + "<div class='wx-wind'>風速</div>"
    + "</div>"
    + "<div class='wx-scroll'>" + cellsHtml + "</div>";
  
  drawChart1(labels, h.cloudcover, h.precipitation);
    drawCloud("chartLow", labels, h.cloudcover_low, "下層雲量（%）", "#e91e8c");
  drawCloud("chartMid", labels, h.cloudcover_mid, "中層雲量（%）", "#2196f3");
  drawCloud("chartHigh", labels, h.cloudcover_high, "上層雲量（%）", "#4caf50");
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
        y: { position: "left", min: 0, max: 100, title: { display: true, text: "雲量（%）" } },
        y1: { position: "right", min: 0, grid: { drawOnChartArea: false }, title: { display: true, text: "降水量（mm）" } }
      }
    }
  });
}

let cloudCharts = {};
function drawCloud(canvasId, labels, data, label, color) {
  if (cloudCharts[canvasId]) cloudCharts[canvasId].destroy();
  cloudCharts[canvasId] = new Chart(document.getElementById(canvasId), {
    type: "line",
    data: {
      labels,
      datasets: [
        { label: label, data: data, borderColor: color, backgroundColor: color + "33", fill: true, pointRadius: 0, tension: 0.3 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      scales: { y: { min: 0, max: 100, title: { display: true, text: "雲量（%）" } } }
    }
  });
}


loadMountains();
