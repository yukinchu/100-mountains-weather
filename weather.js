/*
=========================================
 Mountain GPV
 Weather Module
 Version 0.9.0
=========================================
*/

let forecastChart = null;

// ----------------------------
// 天気取得
// ----------------------------

async function loadWeather(latitude, longitude) {

    // ----------------------------
    // 天気データ取得URL
    // ----------------------------

    const API_MODE = "openmeteo";
    // const API_MODE = "gpv";

    const WEATHER_API =

        API_MODE === "openmeteo"

            ? `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,cloud_cover,precipitation,wind_speed_10m,relative_humidity_2m&hourly=temperature_2m,precipitation,cloud_cover,wind_speed_10m&forecast_days=3&timezone=Asia/Tokyo`

            : `https://example.com/gpv?lat=${latitude}&lon=${longitude}`;

    const url = WEATHER_API;

    try {

        const response = await fetch(url);

        if (!response.ok) {

            throw new Error("Weather API Error");

        }

        const data = await response.json();

        // ----------------------------
        // データ取得
        // ----------------------------

        const weather = getCurrentWeather(data);

        const forecast = getForecast(data);

        showWeather(weather);

        drawForecastChart(forecast);

    }

    catch (error) {

        console.error(error);

        document.getElementById("weather-temperature").textContent =
            "取得失敗";

        document.getElementById("weather-cloud").textContent =
            "--";

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
// 現在天気表示
// ----------------------------

function showWeather(weather) {

    document.getElementById("weather-temperature").textContent =
        weather.temperature_2m.toFixed(1) + " ℃";

    document.getElementById("weather-cloud").textContent =
        weather.cloud_cover + " %";

    document.getElementById("weather-rain").textContent =
        weather.precipitation.toFixed(1) + " mm";

    document.getElementById("weather-wind").textContent =
        weather.wind_speed_10m.toFixed(1) + " m/s";

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
