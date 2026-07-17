/*
=========================================
 Mountain GPV
 Version 0.5.0
=========================================
*/

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
