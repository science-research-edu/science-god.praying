console.log("Super-Patch.js: Initializing full local bypass...");

// 1. Create a Fake Firebase Object
window.firebase = window.firebase || {};

// 2. Mock Analytics
window.firebase.analytics = function() {
    return {
        logEvent: function(n, p) { console.log("Analytics Event:", n); },
        setCurrentScreen: function(n) {},
        setUserId: function(id) {}
    };
};

// 3. Mock RemoteConfig (FIXED: Added getString)
window.firebase.remoteConfig = function() {
    return {
        fetchAndActivate: function() { return Promise.resolve(true); },
        getValue: function() { 
            return { asString: () => "", asNumber: () => 0, asBoolean: () => false }; 
        },
        getString: function(key) { return ""; }, // Fixes the getString error
        getAll: function() { return {}; }
    };
};

// 4. Mock Auth (FIXED: Added getIdToken)
window.firebase.auth = function() {
    let dummyUser = { 
        isAnonymous: true, 
        uid: "local-player-123", 
        nick: "Player",
        getIdToken: function() { return Promise.resolve("local-token"); } // Fixes getIdToken error
    };
    return {
        onAuthStateChanged: function(callback) {
            setTimeout(() => callback(dummyUser), 100);
        },
        currentUser: dummyUser,
        signInAnonymously: function() { return Promise.resolve({ user: dummyUser }); }
    };
};

// 5. Re-apply the Local Downloader
window.downloadLinkedGame = function(guid) {
    console.log("Super-Patch.js: Intercepting game download -> " + guid);
    let url = "./" + guid + ".data"; 
    let xhr = new XMLHttpRequest();
    xhr.responseType = 'blob';
    xhr.onload = () => {
        window.singleGameBlob = xhr.response;
        window.gameDownloadProgressFrac = 1;
        if (typeof updateLoadProgress === "function") updateLoadProgress();
        console.log("Super-Patch.js: Local data loaded.");
    };
    xhr.open('GET', url);
    xhr.send();
};

// 6. Fix Ad/Poki crashes
window.initPokiSdk = function() { window.pokiInited = true; };
window.adInterstitialShow = function() { if(typeof setGameFocus === "function") setGameFocus(true); };
window.adRewardedShow = function() { 
    if (typeof Module !== "undefined" && Module.ccall) {
        Module.ccall("ad_rewarded_on_showed", "v", ["number"], [1]); 
    }
};
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

console.log("Super-Patch.js: All systems bypassed.");
