/*
=========================================
 Mountain GPV
 Weather Module
 Version 0.5.0
=========================================
*/

// ----------------------------
// Open-Meteoから現在の天気を取得
// ----------------------------

async function loadWeather(latitude, longitude) {

    const url =
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,cloud_cover,precipitation,wind_speed_10m&timezone=Asia/Tokyo`;

    try {

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("天気データを取得できません");
        }

        const data = await response.json();

        showWeather(data.current);

    }
    catch (error) {

        console.error(error);

        document.getElementById("weather-temperature").textContent = "取得失敗";
        document.getElementById("weather-cloud").textContent = "--";
        document.getElementById("weather-rain").textContent = "--";
        document.getElementById("weather-wind").textContent = "--";

    }

}

// ----------------------------
// 天気表示
// ----------------------------

function showWeather(weather) {

    document.getElementById("weather-temperature").textContent =
        weather.temperature_2m + " ℃";

    document.getElementById("weather-cloud").textContent =
        weather.cloud_cover + " %";

    document.getElementById("weather-rain").textContent =
        weather.precipitation + " mm";

    document.getElementById("weather-wind").textContent =
        weather.wind_speed_10m + " m/s";

}
