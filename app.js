/*
=========================================
 Mountain GPV
 Version 0.1
=========================================
*/

console.log("Mountain GPV started.");

// ----------------------------
// 初期設定
// ----------------------------

const app = {
    version: "0.1.0",
    name: "Mountain GPV"
};

// ----------------------------
// アプリ起動
// ----------------------------

window.onload = () => {

    console.log(`${app.name} Version ${app.version}`);

    initialize();

};

// ----------------------------
// 初期化
// ----------------------------

function initialize() {

    console.log("Initializing...");

    showWelcomeMessage();

}

// ----------------------------
// 最初に表示する処理
// ----------------------------

function showWelcomeMessage() {

    const mountainName =
        document.getElementById("mountain-name");

    const mountainHeight =
        document.getElementById("mountain-height");

    mountainName.textContent = "ようこそ Mountain GPVへ";

    mountainHeight.textContent =
        "山を検索すると情報が表示されます";

}
