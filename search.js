/*
=========================================
 Mountain GPV
 Search Module
 Version 0.3.0
=========================================
*/

// ----------------------------
// 検索機能を開始
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

        mountain.name.includes(keyword) ||
        mountain.reading.includes(keyword)

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

            resultsDiv.style.display = "none";

            document.getElementById("mountain-search").value =
                mountain.name;

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
        `標高 ${mountain.elevation} m`;

}

// ----------------------------
// 表示を初期化
// ----------------------------

function clearMountainInfo() {

    document.getElementById("mountain-name").textContent =
        "山を選択してください";

    document.getElementById("mountain-height").textContent =
        "標高 --";

}
