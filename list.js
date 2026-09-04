// ===== 天気アイコン =====
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
function fmtHour(t) { return parseInt(t.slice(11, 13), 10); }
function fmtDate(t) {
  const m = parseInt(t.slice(5, 7), 10);
  const d = parseInt(t.slice(8, 10), 10);
  const w = ["日","月","火","水","木","金","土"][new Date(t).getDay()];
  return m + "/" + d + "(" + w + ")";
}

async function init() {
  // 山リスト読み込み
  const mtRes = await fetch("mountains.json");
  const mountains = await mtRes.json();

  // 緯度経度をカンマ区切りでまとめる（★API一括取得）
  const lats = mountains.map(m => m.lat).join(",");
  const lons = mountains.map(m => m.lon).join(",");

  const url = "https://api.open-meteo.com/v1/forecast"
    + "?latitude=" + lats
    + "&longitude=" + lons
    + "&hourly=weathercode,precipitation,precipitation_probability,windspeed_10m"
    + "&models=jma_seamless"
    + "&forecast_days=3"
    + "&timezone=Asia%2FTokyo";

  let dataArr;
  try {
    const res = await fetch(url);
    dataArr = await res.json();
    // 1山だけの場合はオブジェクトで返るため配列化
    if (!Array.isArray(dataArr)) dataArr = [dataArr];
  } catch (e) {
    document.getElementById("status").textContent = "データの取得に失敗しました。時間をおいて再度お試しください。";
    return;
  }

  // 3時間おきの時刻インデックスを作成（先頭の山の時刻を基準）
  const baseTime = dataArr[0].hourly.time;
  const idx = [];
  for (let i = 0; i < baseTime.length; i++) {
    if (fmtHour(baseTime[i]) % 3 === 0) idx.push(i);
  }

  buildHeader(baseTime, idx);
  buildBody(mountains, dataArr, idx);

  document.getElementById("status").style.display = "none";
}

// ===== ヘッダー（日付行＋時刻行）=====
function buildHeader(times, idx) {
  const thead = document.getElementById("tableHead");

  // 日付ごとの列数を数える
  let dateRow = "<tr class='date-row'><th class='mt-name' rowspan='2'>山名</th>";
  let timeRow = "<tr>";
  let prevDate = "";
  let span = 0;
  let buffer = [];

  idx.forEach(i => {
    const dstr = times[i].slice(0, 10);
    if (dstr !== prevDate && prevDate !== "") {
      dateRow += "<th colspan='" + span + "'>" + fmtDate(prevDate) + "</th>";
      span = 0;
    }
    prevDate = dstr;
    span++;
    buffer.push(i);
  });
  if (span > 0) dateRow += "<th colspan='" + span + "'>" + fmtDate(prevDate) + "</th>";
  dateRow += "</tr>";

  // 時刻行
  prevDate = "";
  buffer.forEach(i => {
    const dstr = times[i].slice(0, 10);
    const cls = (dstr !== prevDate) ? "day-start" : "";
    prevDate = dstr;
    timeRow += "<th class='" + cls + "'>" + fmtHour(times[i]) + "時</th>";
  });
  timeRow += "</tr>";

  thead.innerHTML = dateRow + timeRow;
}

// ===== 本体（山ごとの行）=====
function buildBody(mountains, dataArr, idx) {
  const tbody = document.getElementById("tableBody");
  let rows = "";

  mountains.forEach((m, mi) => {
    const h = dataArr[mi].hourly;
    // 詳細ページへのリンク（★クリックで index.html?mt=番号 へ）
    let row = "<tr><td class='mt-name'><a href='index.html?mt=" + mi + "'>" + m.name + "</a></td>";

    let prevDate = "";
    idx.forEach(i => {
      const dstr = h.time[i].slice(0, 10);
      const cls = (dstr !== prevDate) ? "day-start" : "";
      prevDate = dstr;
      const pop  = h.precipitation_probability[i] ?? "-";
      const rain = h.precipitation[i] ?? 0;
      const wind = Math.round(h.windspeed_10m[i] ?? 0);
      row += "<td class='" + cls + "'><div class='cell-block'>"
        + "<span class='c-icon'>" + weatherIcon(h.weathercode[i]) + "</span>"
        + "<span class='c-pop'>" + pop + "%</span>"
        + "<span class='c-rain'>" + rain + "mm</span>"
        + "<span class='c-wind'>" + wind + "m/s</span>"
        + "</div></td>";
    });
    row += "</tr>";
    rows += row;
  });

  tbody.innerHTML = rows;
}

init();
