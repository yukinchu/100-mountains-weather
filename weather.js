/*
=========================================
 Mountain GPV
 Weather Module
 Version 0.8.0
=========================================
*/

let forecastChart = null;

// ----------------------------
// 天気取得
// ----------------------------

async function loadWeather(latitude, longitude) {

    const url =
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,cloud_cover,precipitation,wind_speed_10m,relative_humidity_2m&hourly=temperature_2m,precipitation,cloud_cover,wind_speed_10m&forecast_days=3&timezone=Asia/Tokyo`;

    try {

        const response = await fetch(url);

        if (!response.ok) {

            throw new Error("Weather API Error");

        }

        const data = await response.json();

        showWeather(data.current);

        drawForecastChart(data.hourly);

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

    const temperatures =
        hourly.temperature_2m.slice(0, 72);

    const rain =
        hourly.precipitation.slice(0, 72);

    const wind =
        hourly.wind_speed_10m.slice(0, 72);

    const cloud =
        hourly.cloud_cover.slice(0, 72);

    if (forecastChart) {

        forecastChart.destroy();

    }

    const ctx =
        document
            .getElementById("forecastChart")
            .getContext("2d");

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
                    borderWidth: 2
                },

                {
                    type: "bar",
                    label: "降水量 (mm)",
                    data: rain,
                    yAxisID: "y1"
                },

                {
                    type: "line",
                    label: "風速 (m/s)",
                    data: wind,
                    yAxisID: "y2",
                    tension: 0.3,
                    borderWidth: 2
                },

                {
                    type: "line",
                    label: "雲量 (%)",
                    data: cloud,
                    yAxisID: "y3",
                    tension: 0.3,
                    borderWidth: 2
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

                    position: "top"

                }

            },

            scales: {

                x: {

                    ticks: {

                        maxTicksLimit: 12

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
