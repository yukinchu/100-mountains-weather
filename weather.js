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

    const ctx = document
        .getElementById("weatherChart")
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
