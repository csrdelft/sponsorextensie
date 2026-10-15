import Functions, { sponsortabs } from "./functions.js";
import Constants from "./constants.js";

const functions = new Functions();
functions.checkUpdate();

browser.webNavigation.onCommitted.addListener(functions.navigationCompleteListener);

// GC closing tabs to keep sponsortabs map clean
browser.tabs.onRemoved.addListener(function (tabId) {
  console.log(`L11 ${tabId} is being removed`);
  if (sponsortabs[tabId]) {
    delete sponsortabs[tabId];
  }
  browser.notifications.clear(Constants.NOTIFICATION_ID + tabId);
});

// Register for periodic endpoint updates and check for new update
browser.runtime.onInstalled.addListener(function (details) {
  console.log("L20 periodic check register");
  browser.alarms.create("SLupdateCheck", {
    delayInMinutes: Constants.UPDATE_CHECK_INTERVAL,
    periodInMinutes: Constants.UPDATE_CHECK_INTERVAL,
  });

  console.log("L36 check if there was an update");
  if (details.reason === "update") {
    browser.storage.local.remove([Constants.URLS_KEY, Constants.LASTCHECK_KEY]);
    functions.checkUpdate();
  }
});

// Automatic updates 
browser.alarms.onAlarm.addListener(function (alarm) {
  console.log(`L28 alarm ${alarm} being added`);
  if (alarm.name === "SLupdateCheck") {
    functions.checkUpdate();
  }
});
