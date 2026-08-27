let chart1, chart2;

// 山リストを読み込む
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
    showWeather(mountains[select.value]);
  });
  if (mountains.length > 0) showWeather(mountains[0]);
}

// 気象データを取得して描画
async function showWeather(m) {
  const url = "https://api.open-meteo.com/v1/forecast"
    + "?latitude=" + m.lat
    + "&longitude=" + m.lon
    + "&hourly=precipitation,cloudcover,cloudcover_low,cloudcover_mid,cloudcover_high"
    + "&models=jma_seamless"
    + "&timezone=Asia%2FTokyo";

  const res = await fetch(url);
  const data = await res.json();
  const h = data.hourly;

  const title = m.name + " 緯度:" + m.lat + " 経度:" + m.lon;
  document.getElementById("title1").textContent = title;
  document.getElementById("title2").textContent = title;

  const labels = h.time.map(t => t.slice(5, 10) + " " + t.slice(11, 16));

  drawChart1(labels, h.cloudcover, h.precipitation);
  drawChart2(labels, h.cloudcover_low, h.cloudcover_mid, h.cloudcover_high);
}

// グラフ1：雲量(面) + 降水量(棒)
function drawChart1(labels, cloud, precip) {
  if (chart1) chart1.destroy();
  chart1 = new Chart(document.getElementById("chart1"), {
    data: {
      labels: labels,
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
      interaction: { mode: "index", intersect: false },
      scales: {
        y: { position: "left", min: 0, max: 100, title: { display: true, text: "雲量（%）" } },
        y1: { position: "right", min: 0, max: 10, grid: { drawOnChartArea: false }, title: { display: true, text: "降水量（mm）" } }
      }
    }
  });
}

// グラフ2：上層・中層・下層の雲量(線)
function drawChart2(labels, low, mid, high) {
  if (chart2) chart2.destroy();
  chart2 = new Chart(document.getElementById("chart2"), {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        { label: "上層雲量（%）", data: high, borderColor: "#4caf50", pointRadius: 0, tension: 0.3 },
        { label: "中層雲量（%）", data: mid, borderColor: "#2196f3", pointRadius: 0, tension: 0.3 },
        { label: "下層雲量（%）", data: low, borderColor: "#e91e8c", pointRadius: 0, tension: 0.3 }
      ]
    },
    options: {
      responsive: true,
      interaction: { mode: "index", intersect: false },
      scales: {
        y: { min: 0, max: 100, title: { display: true, text: "雲量（%）" } }
      }
    }
  });
}

loadMountains();
