// Add this to the BOTTOM of your patch.js
function forceShowButton() {
    let p = document.getElementById("progress_or_play");
    if (p && !p.innerHTML.includes("PLAY")) {
        console.log("Patch.js: Forcing Play Button display.");
        p.innerHTML = `<a class="overlay_button" href="#" onclick="checkStartGame(); return false;">PLAY NOW</a>`;
    }
}

// Check every 2 seconds if we should show the button
setInterval(() => {
    if (window.gameDownloadProgressFrac >= 1) {
        forceShowButton();
    }
}, 2000);