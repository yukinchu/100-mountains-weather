/*
=========================================
 Mountain GPV
 Version 0.2
=========================================
*/

const app = {
    version: "0.2.0",
    mountains: []
};

window.onload = async () => {

    console.log("Mountain GPV Started");

    await loadMountains();

    initializeSearch();

};

// ----------------------------
// 山データ読込
// ----------------------------

async function loadMountains() {

    try {

        const response = await fetch("mountains.json");

        app.mountains = await response.json();

        console.log(app.mountains.length + " mountains loaded.");

    } catch (error) {

        console.error(error);

    }

}

// ----------------------------
// 検索
// ----------------------------

function initializeSearch() {

    const input = document.getElementById("mountain-search");

    input.addEventListener("input", searchMountain);

}

// ----------------------------
// 検索実行
// ----------------------------

function searchMountain(event) {

    const keyword = event.target.value.toLowerCase();

    if (keyword === "") {

        document.getElementById("mountain-name").textContent =
            "山を選択してください";

        document.getElementById("mountain-height").textContent =
            "標高 --";

        return;

    }

    const result = app.mountains.find(mountain =>

        mountain.name.includes(keyword) ||
        mountain.reading.includes(keyword)

    );

    if (!result) {

        document.getElementById("mountain-name").textContent =
            "見つかりません";

        document.getElementById("mountain-height").textContent =
            "";

        return;

    }

    document.getElementById("mountain-name").textContent =
        result.name;

    document.getElementById("mountain-height").textContent =
        `標高 ${result.elevation} m`;

}
