importScripts("src/functions.js");

let sponsortabs = [];

checkUpdate();

browser.webNavigation.onCommitted.addListener(navigationCompleteListener);

// GC closing tabs to keep sponsortabs map clean
browser.tabs.onRemoved.addListener(function (tabId) {
    console.log(`L11 ${tabId} is being removed`);
    if (sponsortabs[tabId]) {
        delete sponsortabs[tabId];
    }
    browser.notifications.clear(NOTIFICATION_ID);
});

// Register for periodic endpoint updates
browser.runtime.onInstalled.addListener(function () {
    console.log("L20 periodic check register");
    browser.alarms.create("SLupdateCheck", {
        delayInMinutes: UPDATE_CHECK_INTERVAL,
        periodInMinutes: UPDATE_CHECK_INTERVAL,
    });
});

browser.alarms.onAlarm.addListener(function (alarm) {
    console.log(`L28 alarm ${alarm} being added`);
    if (alarm.name === "SLupdateCheck") {
        checkUpdate();
    }
});

// Check whether new version is installed
browser.runtime.onInstalled.addListener(function (details) {
    console.log(`L36 details ${details} to check if there was an update`);
    if (details.reason === "update") {
        browser.storage.local.clear();
        checkUpdate();
    }
});