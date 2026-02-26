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

// 3. Mock RemoteConfig (Fixes your current crash)
window.firebase.remoteConfig = function() {
    return {
        fetchAndActivate: function() { return Promise.resolve(true); },
        getValue: function() { return { asString: function() { return ""; }, asNumber: function() { return 0; }, asBoolean: function() { return false; } }; },
        getAll: function() { return {}; }
    };
};

// 4. Mock Auth (Crucial for the engine to proceed)
window.firebase.auth = function() {
    let dummyUser = { isAnonymous: true, uid: "local-player-123", nick: "Player" };
    return {
        onAuthStateChanged: function(callback) {
            // Tell the game we are "logged in" as a guest after a tiny delay
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

console.log("Super-Patch.js: All systems bypassed.");