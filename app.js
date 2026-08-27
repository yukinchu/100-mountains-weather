let chart1, chart2, chart3;

const weatherIcon = (code) => {
  if (code === 0) return "☀️";
  if (code <= 2) return "🌤️";
  if (code === 3) return "☁️";
  if (code >= 45 && code <= 48) return "🌫️";
  if (code >= 51 && code <= 67) return "🌧️";
  if (code >= 71 && code <= 77) return "❄️";
  if (code >= 80 && code <= 82) return "🌧️";
  if (code >= 95) return "⛈️";
  return "☁️";
};

// 日付を 8/27 に、時刻を 8時 に整形
const fmtLabel = (t) => {
  const m = parseInt(t.slice(5, 7), 10);
  const d = parseInt(t.slice(8, 10), 10);
  const h = parseInt(t.slice(11, 13), 10);
  return m + "/" + d + " " + h + "時";
};
const fmtDate = (t) => {
  const m = parseInt(t.slice(5, 7), 10);
  const d = parseInt(t.slice(8, 10), 10);
  return m + "/" + d;
};
const fmtTime = (t) => parseInt(t.slice(11, 13), 10) + "時";

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
  select.addEventListener("change", () => showWeather(mountains[select.value]));
  if (mountains.length > 0) showWeather(mountains[0]);
}

async function showWeather(m) {
  const url = "https://api.open-meteo.com/v1/forecast"
    + "?latitude=" + m.lat
    + "&longitude=" + m.lon
    + "&hourly=temperature_2m,windspeed_10m,weathercode,precipitation,cloudcover,cloudcover_low,cloudcover_mid,cloudcover_high"
    + "&models=jma_seamless"
    + "&timezone=Asia%2FTokyo";

  const res = await fetch(url);
  const data = await res.json();
  const h = data.hourly;

  const title = m.name + " 緯度:" + m.lat + " 経度:" + m.lon;
  ["titleWeather", "title1", "title2", "title3"].forEach(id => {
    document.getElementById(id).textContent = title;
  });

  const labels = h.time.map(fmtLabel);

  // 天気ストリップ（3時間おきに表示）
  const strip = document.getElementById("weatherStrip");
  strip.innerHTML = "";
  for (let i = 0; i < h.time.length; i += 3) {
    const cell = document.createElement("div");
    cell.className = "weather-cell";
    cell.innerHTML =
      "<div class='w-date'>" + fmtDate(h.time[i]) + "</div>"
      + "<div class='w-time'>" + fmtTime(h.time[i]) + "</div>"
      + "<div class='w-icon'>" + weatherIcon(h.weathercode[i]) + "</div>";
    strip.appendChild(cell);
  }

  drawChart1(labels, h.cloudcover, h.precipitation);
  drawChart2(labels, h.cloudcover_low, h.cloudcover_mid, h.cloudcover_high);
  drawChart3(labels, h.temperature_2m, h.windspeed_10m);
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
        y1: { position: "right", min: 0, max: 10, grid: { drawOnChartArea: false }, title: { display: true, text: "降水量（mm）" } }
      }
    }
  });
}

function drawChart2(labels, low, mid, high) {
  if (chart2) chart2.destroy();
  chart2 = new Chart(document.getElementById("chart2"), {
    type: "line",
    data: {
      labels,
      datasets: [
        { label: "上層雲量（%）", data: high, borderColor: "#4caf50", pointRadius: 0, tension: 0.3 },
        { label: "中層雲量（%）", data: mid, borderColor: "#2196f3", pointRadius: 0, tension: 0.3 },
        { label: "下層雲量（%）", data: low, borderColor: "#e91e8c", pointRadius: 0, tension: 0.3 }
      ]
    },
    options: {
      responsive: true,
      interaction: { mode: "index", intersect: false },
      scales: { y: { min: 0, max: 100, title: { display: true, text: "雲量（%）" } } }
    }
  });
}

function drawChart3(labels, temp, wind) {
  if (chart3) chart3.destroy();
  chart3 = new Chart(document.getElementById("chart3"), {
    type: "line",
    data: {
      labels,
      datasets: [
        { label: "気温（℃）", data: temp, yAxisID: "y", borderColor: "#e53935", pointRadius: 0, tension: 0.3 },
        { label: "風速（m/s）", data: wind, yAxisID: "y1", borderColor: "#1e88e5", pointRadius: 0, tension: 0.3 }
      ]
    },
    options: {
      responsive: true,
      interaction: { mode: "index", intersect: false },
      scales: {
        y: { position: "left", title: { display: true, text: "気温（℃）" } },
        y1: { position: "right", grid: { drawOnChartArea: false }, title: { display: true, text: "風速（m/s）" } }
      }
    }
  });
}

loadMountains();
