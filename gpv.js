/*
=========================================
 100-Mountains-weather
 GPV Modulegpv
 Version 1.0.0
=========================================
*/

// ----------------------------
// GPV取得
// ----------------------------

async function loadGPV(latitude, longitude) {

    console.log("GPV MODE");

    const response = await fetch(
        `gpv.php?lat=${latitude}&lon=${longitude}`
    );

    if (!response.ok) {

        throw new Error("GPV API Error");

    }

    return await response.json();

}
