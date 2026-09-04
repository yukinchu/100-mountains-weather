let chart1;
let chartLow;
let chartMid;
let chartHigh;
let currentMountain = null;
let currentModel = "jma_seamless";

const COL_WIDTH = 52;

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

// ★ 全期間を3時間刻みでフィルタリング
function filterEvery3Hours(h) {
  const result = {
    time: [],
    temperature_2m: [],
    precipitation: [],
    precipitation_probability: [],
    relativehumidity_2m: [],
    weathercode: [],
    windspeed_10m: [],
    cloudcover: [],
    cloudcover_low: [],
    cloudcover_mid: [],
    cloudcover_high: []
  };

  for (let i = 0; i < h.time.length; i++) {
    const hour = fmtHour(h.time[i]);
    if (hour % 3 !== 0) continue;
    result.time.push(h.time[i]);
    result.temperature_2m.push(h.temperature_2m[i]);
    result.precipitation.push(h.precipitation[i]);
    result.precipitation_probability.push(h.precipitation_probability[i]);
    result.relativehumidity_2m.push(h.relativehumidity_2m[i]);
    result.weathercode.push(h.weathercode[i]);
    result.windspeed_10m.push(h.windspeed_10m[i]);
    result.cloudcover.push(h.cloudcover[i]);
    result.cloudcover_low.push(h.cloudcover_low[i]);
    result.cloudcover_mid.push(h.cloudcover_mid[i]);
    result.cloudcover_high.push(h.cloudcover_high[i]);
  }
  return result;
}

// ★ グラフの横幅を列数×COL_WIDTHに合わせる
function adjustGraphWidth(colCount) {
  const totalWidth = colCount * COL_WIDTH;
  const graphBlocks = document.querySelectorAll(".graph-block");
  graphBlocks.forEach(block => {
    block.style.width = totalWidth + "px";
    block.style.minWidth = totalWidth + "px";
  });
  const graphScroll = document.getElementById("graphScroll");
  if (graphScroll) {
    graphScroll.style.width = totalWidth + "px";
    graphScroll.style.minWidth = totalWidth + "px";
  }
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
  document.getElementById("title1").textContent = title;

  // ★ 3時間刻みフィルタリング
  const filtered = filterEvery3Hours(h);

  buildStrip(filtered);

  // ★ ラベルを縦書き対応（改行区切り）
  const labels = filtered.time.map(t => {
    const hour = fmtHour(t);
    return fmtDate(t) + "\n" + hour + "時";
  });

  drawChart1(labels, filtered.cloudcover, filtered.precipitation);
  drawCloud("chartLow",  labels, filtered.cloudcover_low,  "下層雲量", "#e91e8c");
  drawCloud("chartMid",  labels, filtered.cloudcover_mid,  "中層雲量", "#2196f3");
  drawCloud("chartHigh", labels, filtered.cloudcover_high, "上層雲量", "#4caf50");

  // ★ グラフ幅を列数に合わせて調整
  adjustGraphWidth(filtered.time.length);

  syncScroll();
}

function buildStrip(h) {
  const strip = document.getElementById("weatherStrip");
  strip.innerHTML = "";
  let cells = "";

  for (let i = 0; i < h.time.length; i++) {
    const hour = fmtHour(h.time[i]);
    const t = new Date(h.time[i]);
    const baseTime = new Date(h.time[0]);
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

// ★ chart1：雲量（全体）＋降水量　Y軸ラベルを非表示
function drawChart1(labels, cloud, precip) {
  if (chart1) chart1.destroy();
  chart1 = new Chart(document.getElementById("chart1"), {
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
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          ticks: {
            // ★ ラベルを縦90度に
            maxRotation: 90,
            minRotation: 90,
            font: { size: 10 }
          }
        },
        y: {
          position: "left",
          min: 0,
          max: 100,
          // ★ Y軸タイトル非表示
          display: false
        },
        y1: {
          position: "right",
          min: 0,
          grid: { drawOnChartArea: false },
          // ★ Y軸タイトル非表示
          display: false
        }
      }
    }
  });
}

// ★ 雲量グラフ共通描画関数（Y軸ラベル非表示・縦ラベル）
function drawCloud(canvasId, labels, data, label, color) {
  // 既存チャートを破棄
  if (canvasId === "chartLow"  && chartLow)  { chartLow.destroy();  chartLow  = null; }
  if (canvasId === "chartMid"  && chartMid)  { chartMid.destroy();  chartMid  = null; }
  if (canvasId === "chartHigh" && chartHigh) { chartHigh.destroy(); chartHigh = null; }

  const newChart = new Chart(document.getElementById(canvasId), {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: label,
          data: data,
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
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          ticks: {
            // ★ ラベルを縦90度に
            maxRotation: 90,
            minRotation: 90,
            font: { size: 10 }
          }
        },
        y: {
          min: 0,
          max: 100,
          // ★ Y軸非表示
          display: false
        }
      }
    }
  });

  if (canvasId === "chartLow")  chartLow  = newChart;
  if (canvasId === "chartMid")  chartMid  = newChart;
  if (canvasId === "chartHigh") chartHigh = newChart;
}

// ★ スクロール同期
function syncScroll() {
  const scrollWrapper = document.getElementById("unifiedScroll");
  if (!scrollWrapper) return;

  // 既存のイベントリスナーをリセットするためクローン置換
  const newWrapper = scrollWrapper.cloneNode(true);
  scrollWrapper.parentNode.replaceChild(newWrapper, scrollWrapper);

  newWrapper.addEventListener("scroll", () => {
    // unified-scroll-wrapper内はすべて同一コンテナのため
    // 追加の同期処理は不要（1コンテナで完結）
  });
}

loadMountains();
