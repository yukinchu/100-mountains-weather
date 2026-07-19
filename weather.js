/*
=========================================
 Mountain GPV
 Weather Module
 Version 0.7.0
=========================================
*/

let forecastChart = null;

// ----------------------------
// 天気取得
// ----------------------------

async function loadWeather(latitude, longitude) {

    const url =
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,cloud_cover,precipitation,wind_speed_10m&hourly=temperature_2m&timezone=Asia/Tokyo`;

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
// 現在の天気表示
// ----------------------------

function showWeather(weather){

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

function drawForecastChart(hourly){

    const labels = hourly.time
        .slice(0,72)
        .map(time => time.substring(5,16));

    const temperatures =
        hourly.temperature_2m.slice(0,72);

    if(forecastChart){

        forecastChart.destroy();

    }

    const ctx =
        document
            .getElementById("forecastChart")
            .getContext("2d");

    forecastChart = new Chart(ctx,{

        type:"line",

        data:{

            labels:labels,

            datasets:[{

                label:"気温 (℃)",

                data:temperatures,

                borderWidth:2,

                tension:0.3

            }]

        },

        options:{

            responsive:true,

            maintainAspectRatio:false,

            plugins:{

                legend:{

                    display:true

                }

            },

            scales:{

                x:{

                    ticks:{

                        maxTicksLimit:12

                    }

                }

            }

        }

    });

}
