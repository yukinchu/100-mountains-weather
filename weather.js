/*
=========================================
 Mountain GPV
 Weather Module
 Version 0.9.0
=========================================
*/


// ----------------------------
// 天気取得
// ----------------------------

async function loadWeather(latitude, longitude) {

showLoading();
 
    // ----------------------------
    // 天気データ取得URL
    // ----------------------------

const API_MODE = app.weatherProvider;
    // const API_MODE = "gpv";


const OPENMETEO_API =
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,cloud_cover,precipitation,wind_speed_10m,relative_humidity_2m,weather_code&hourly=temperature_2m,precipitation,cloud_cover,wind_speed_10m&forecast_days=3&timezone=Asia/Tokyo`;

const url = OPENMETEO_API; 

    try {

let data;

if (API_MODE === "openmeteo") {

    const response = await fetch(url);

    if (!response.ok) {

        throw new Error("Open-Meteo API Error");

    }

    data = await response.json();

}

else if (API_MODE === "gpv") {

    data = await loadGPV(latitude, longitude);

}
     
        // ----------------------------
        // データ取得
        // ----------------------------

        const weather = getCurrentWeather(data);

        const forecast = getForecast(data);

     showWeather(weather, app.selectedMountain);
     
        drawForecastChart(forecast);

    }

catch (error) {

    console.error(error);

const weatherText = document.getElementById("weather-text");

weatherText.textContent = weatherLabel;

// 天気に応じて色を変更
weatherText.className = "weather-main";

if (weather.weather_code === 0) {

    weatherText.classList.add("weather-sunny");

}

else if ([1, 2].includes(weather.weather_code)) {

    weatherText.classList.add("weather-partly");

}

else if (weather.weather_code === 3) {

    weatherText.classList.add("weather-cloudy");

}

else if (
    [51,53,55,61,63,65,80,81,82].includes(weather.weather_code)
) {

    weatherText.classList.add("weather-rain");

}

else if (
    [71,73,75,85,86].includes(weather.weather_code)
) {

    weatherText.classList.add("weather-snow");

}

else if (
    [95,96,99].includes(weather.weather_code)
) {

    weatherText.classList.add("weather-thunder");

} 
    document.getElementById("weather-temperature").textContent =
        "取得失敗";

    document.getElementById("weather-cloud").textContent =
        error.message;

    document.getElementById("weather-rain").textContent =
        "--";

    document.getElementById("weather-wind").textContent =
        "--";

}
}

// ----------------------------
// 現在天気取得
// Open-Meteo / GPV 共通
// ----------------------------

function getCurrentWeather(data) {

    if (data.current) {

        return data.current;

    }

    if (data.current_weather) {

        return data.current_weather;

    }

    throw new Error("現在天気データがありません");

}

// ----------------------------
// 予報取得
// Open-Meteo / GPV 共通
// ----------------------------

function getForecast(data) {

    if (data.hourly) {

        return data.hourly;

    }

    if (data.forecast) {

        return data.forecast;

    }

    throw new Error("予報データがありません");
 }

// ----------------------------
// 読み込み中表示
// ----------------------------

function showLoading() {

    document.getElementById("weather-temperature").textContent =
        "取得中...";

    document.getElementById("weather-cloud").textContent =
        "--";

    document.getElementById("weather-rain").textContent =
        "--";

    document.getElementById("weather-wind").textContent =
        "--";

}

// ----------------------------
// 天気コード → 日本語
// ----------------------------

function getWeatherText(weatherCode) {

    const weatherMap = {

        0: "快晴",
        1: "晴れ",
        2: "晴れ時々曇り",
        3: "曇り",

        45: "霧",
        48: "着氷性の霧",

        51: "弱い霧雨",
        53: "霧雨",
        55: "強い霧雨",

        61: "弱い雨",
        63: "雨",
        65: "強い雨",

        66: "着氷性の雨",
        67: "強い着氷性の雨",

        71: "弱い雪",
        73: "雪",
        75: "大雪",

        77: "雪粒",

        80: "にわか雨",
        81: "強いにわか雨",
        82: "激しいにわか雨",

        85: "にわか雪",
        86: "強いにわか雪",

        95: "雷雨",
        96: "雷雨（雹）",
        99: "激しい雷雨"

    };

    return weatherMap[weatherCode] || "不明";

}
// ----------------------------
// 天気アイコン取得
// ----------------------------

function getWeatherIcon(code) {

    switch (code) {

        case 0:
            return "☀️";

        case 1:
        case 2:
            return "🌤";

        case 3:
            return "☁️";

        case 45:
        case 48:
            return "🌫";

        case 51:
        case 53:
        case 55:
        case 61:
        case 63:
        case 65:
        case 80:
        case 81:
        case 82:
            return "🌧";

        case 71:
        case 73:
        case 75:
        case 85:
        case 86:
            return "❄️";

        case 95:
        case 96:
        case 99:
            return "⛈";

        default:
            return "❓";

    }

}

// ----------------------------
// 現在天気表示
// ----------------------------

function showWeather(weather, mountain) {

    const weatherText = document.getElementById("weather-text");

    const weatherLabel =
        `${getWeatherIcon(weather.weather_code)} ${getWeatherText(weather.weather_code)}`;

    weatherText.textContent = weatherLabel;

    // デフォルトクラス
    weatherText.className = "weather-main";

    // 天気ごとの色
    if (weather.weather_code === 0) {

        weatherText.classList.add("weather-sunny");

    }

    else if ([1, 2].includes(weather.weather_code)) {

        weatherText.classList.add("weather-partly");

    }

    else if (weather.weather_code === 3) {

        weatherText.classList.add("weather-cloudy");

    }

    else if ([51,53,55,61,63,65,80,81,82].includes(weather.weather_code)) {

        weatherText.classList.add("weather-rain");

    }

    else if ([71,73,75,85,86].includes(weather.weather_code)) {

        weatherText.classList.add("weather-snow");

    }

    else if ([95,96,99].includes(weather.weather_code)) {

        weatherText.classList.add("weather-thunder");

    }

    document.getElementById("weather-temperature").textContent =
        weather.temperature_2m.toFixed(1) + " ℃";

let comment = "";

if (summitTemp <= 0) {

    comment = "❄️ 厳しい寒さです。冬山装備が必要です。";

}

else if (summitTemp <= 10) {

    comment = "🧥 防寒着を推奨します。";

}

else if (summitTemp <= 20) {

    comment = "😊 登山に適した気温です。";

}

else {

    comment = "🥵 暑さ対策・熱中症に注意してください。";

}

document.getElementById("mountain-comment").textContent =
    comment;
 
 
    document.getElementById("weather-cloud").textContent =
        weather.cloud_cover + " %";

    document.getElementById("weather-rain").textContent =
        weather.precipitation.toFixed(1) + " mm";

    document.getElementById("weather-wind").textContent =
        weather.wind_speed_10m.toFixed(1) + " m/s";
 
// ----------------------------
// 山頂推定気温
// 気温減率：100mごとに約0.6℃
/* ---------------------------- */

if (mountain) {

    const elevation = mountain.elevation;

    const summitTemp =
        weather.temperature_2m - (elevation * 0.006);

    document.getElementById("summit-temperature").textContent =
        summitTemp.toFixed(1) + " ℃";

}
}

// ----------------------------
// 72時間予報グラフ
// ----------------------------

function drawForecastChart(hourly) {

    const labels = hourly.time.slice(0, 72).map(time => {

        const date = new Date(time);

        return (
            (date.getMonth() + 1) +
            "/" +
            date.getDate() +
            " " +
            String(date.getHours()).padStart(2, "0") +
            ":00"
        );

    });

    const temperatures = hourly.temperature_2m.slice(0, 72);
    const rain = hourly.precipitation.slice(0, 72);
    const wind = hourly.wind_speed_10m.slice(0, 72);
    const cloud = hourly.cloud_cover.slice(0, 72);

    if (forecastChart) {

        forecastChart.destroy();

    }

    const canvas = document.getElementById("forecastChart");

    if (!canvas) {

        console.error("forecastChart が見つかりません。");

        return;

    }

    const ctx = canvas.getContext("2d");

    forecastChart = new Chart(ctx, {

        data: {

            labels: labels,

            datasets: [

                {
                    type: "line",
                    label: "気温 (℃)",
                    data: temperatures,
                    yAxisID: "y",
                    tension: 0.3,
                    borderWidth: 1.2,
                    pointRadius: 0,
                    pointHoverRadius: 4
                },

                {
                    type: "bar",
                    label: "降水量 (mm)",
                    data: rain,
                    yAxisID: "y1",
                    barPercentage: 0.7,
                    categoryPercentage: 0.8
                },

                {
                    type: "line",
                    label: "風速 (m/s)",
                    data: wind,
                    yAxisID: "y2",
                    tension: 0.3,
                    borderWidth: 1.2,
                    pointRadius: 0,
                    pointHoverRadius: 4
                },

                {
                    type: "line",
                    label: "雲量 (%)",
                    data: cloud,
                    yAxisID: "y3",
                    tension: 0.3,
                    borderWidth: 1.2,
                    pointRadius: 0,
                    pointHoverRadius: 4
                }

            ]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            interaction: {

                mode: "index",
                intersect: false

            },

            plugins: {

                legend: {

                    position: "top",

                    labels: {

                        boxWidth: 12,

                        font: {

                            size: 11

                        }

                    }

                }

            },

            scales: {

                x: {

                    ticks: {

                        maxTicksLimit: 12,
                        maxRotation: 0

                    }

                },

                y: {

                    position: "left",

                    title: {

                        display: true,
                        text: "気温"

                    }

                },

                y1: {

                    position: "right",

                    grid: {

                        drawOnChartArea: false

                    },

                    title: {

                        display: true,
                        text: "降水"

                    }

                },

                y2: {

                    display: false

                },

                y3: {

                    display: false

                }

            }

        }

    });

}
