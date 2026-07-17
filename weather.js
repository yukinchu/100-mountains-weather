/*
=========================================
 Mountain GPV
 Weather Module
 Version 0.4.0
=========================================
*/

async function loadWeather(lat, lon) {

    const url =
`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,cloud_cover,precipitation,wind_speed_10m&timezone=Asia/Tokyo`;

    try {

        const response = await fetch(url);

        const data = await response.json();

        showWeather(data.current);

    }

    catch(error){

        console.error(error);

    }

}

function showWeather(weather){

    document.getElementById("weather-temperature").textContent =
        weather.temperature_2m + " ℃";

    document.getElementById("weather-cloud").textContent =
        weather.cloud_cover + " %";

    document.getElementById("weather-rain").textContent =
        weather.precipitation + " mm";

    document.getElementById("weather-wind").textContent =
        weather.wind_speed_10m + " m/s";

}
