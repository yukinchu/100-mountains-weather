/*
=========================================
 Mountain GPV
 Search Module
 Version 0.6.1
=========================================
*/

// ----------------------------
// 検索機能開始
// ----------------------------

function initializeSearch() {

    const input = document.getElementById("mountain-search");

    input.addEventListener("input", searchMountain);

}

// ----------------------------
// 山検索
// ----------------------------

function searchMountain(event) {

    const keyword = event.target.value.trim().toLowerCase();

    const resultsDiv = document.getElementById("search-results");

    resultsDiv.innerHTML = "";

    if (keyword === "") {

        resultsDiv.style.display = "none";

        clearMountainInfo();

        return;

    }

    const results = app.mountains.filter(mountain =>

        mountain.name.startsWith(keyword) ||
        mountain.reading.startsWith(keyword)

    );

    if (results.length === 0) {

        resultsDiv.style.display = "none";

        document.getElementById("mountain-name").textContent =
            "見つかりません";

        document.getElementById("mountain-height").textContent =
            "";

        return;

    }

    resultsDiv.style.display = "block";

    results.forEach(mountain => {

        const item = document.createElement("div");

        item.className = "search-item";

        item.textContent = "🏔 " + mountain.name;

        item.onclick = () => {

            showMountain(mountain);

            document.getElementById("mountain-search").value =
                mountain.name;

            resultsDiv.style.display = "none";

        };

        resultsDiv.appendChild(item);

    });

}

// ----------------------------
// 山情報表示
// ----------------------------

function showMountain(mountain) {

    document.getElementById("mountain-name").textContent =
        mountain.name;

    document.getElementById("mountain-height").textContent =
        "標高 " + mountain.elevation + " m";

if (
    mountain.latitude !== undefined &&
    mountain.longitude !== undefined
) {

    loadWeather(
        mountain.latitude,
        mountain.longitude
    );

    // ----------------------------
    // 地図更新
    // ----------------------------

    if (map) {

        map.setView(
            [
                mountain.latitude,
                mountain.longitude
            ],
            11
        );

        if (marker) {

            map.removeLayer(marker);

        }

        marker = L.marker(
            [
                mountain.latitude,
                mountain.longitude
            ]
        ).addTo(map);

        marker
            .bindPopup(
                "🏔 " + mountain.name
            )
            .openPopup();

    }

}
}

// ----------------------------
// 初期化
// ----------------------------

function clearMountainInfo() {

    document.getElementById("mountain-name").textContent =
        "山を選択してください";

    document.getElementById("mountain-height").textContent =
        "標高 --";

    document.getElementById("weather-temperature").textContent =
        "--";

    document.getElementById("weather-cloud").textContent =
        "--";

    document.getElementById("weather-rain").textContent =
        "--";

    document.getElementById("weather-wind").textContent =
        "--";

}
