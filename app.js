/*
=========================================
 Mountain GPV
 Version 0.5.0
=========================================
*/

// ----------------------------
// 地図
// ----------------------------

let map = null;
let marker = null;

const app = {
    version: "0.5.0",
    mountains: []
};

// ----------------------------
// アプリ起動
// ----------------------------

window.onload = async () => {

    console.log("=================================");
    console.log(" Mountain GPV");
    console.log(" Version " + app.version);
    console.log("=================================");

    await loadMountains();

    initializeSearch();
initializeMap();
 
    console.log("Application Ready");

};

// ----------------------------
// 山データ読込
// ----------------------------

async function loadMountains() {

    try {

        const response = await fetch("mountains.json");

        if (!response.ok) {
            throw new Error("mountains.json を読み込めません");
        }

        app.mountains = await response.json();

        console.log(
            app.mountains.length +
            " mountains loaded."
        );

    }

    catch (error) {

        console.error(error);

        alert("山データの読込に失敗しました。");

    }

}

// ----------------------------
// 地図初期化
// ----------------------------

function initializeMap() {

    map = L.map("map").setView(
        [36.2, 138.2],
        5
    );

    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            attribution: "&copy; OpenStreetMap contributors"
        }
    ).addTo(map);

}
