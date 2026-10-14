import Constants from "./constants.js";

var endpoint = "https://api.sponsorkliks.com/v1.0/";

const browser = globalThis.browser ?? globalThis.chrome;

export const sponsortabs = {};

export default class Functions {
  /**
  * Check if we should update the websites with affiliate links from the API
  * Links are updated every 24 hours
  */
  checkUpdate() {
    Functions.getStorage([Constants.URLS_KEY, Constants.LASTCHECK_KEY], (storage) => {
      if (typeof storage[Constants.URLS_KEY] !== "undefined") {
        const lastCheck = storage[Constants.LASTCHECK_KEY] || 0;
        if (lastCheck < Functions.unixDayAgo()) {
          browser.storage.local.set({
            [Constants.LASTCHECK_KEY]: Functions.unixTime(new Date()),
          });
          this.updateURLs().catch((e) => console.log("Failed to update urls", e));
        }
      } else {
        this.updateURLs().catch((e) => console.log("Failed to update urls", e));
      }
    });
  }

  /**
  * Get all the websites with affiliate links from the API
  */
  async updateURLs() {
    let mogelijkeWinkels = []

    try {
      let winkelReq = await fetch(Constants.BASE_API + "?call=webshops_club&show=json&code=" + Constants.API_CODE);
      winkelReq = await winkelReq.json();
      let winkels = winkelReq.webshops;

      let winkelUrlReq = await fetch(Constants.BASE_API + "get_shops.php?code=" + Constants.API_CODE);
      let winkelUrl = await winkelUrlReq.json();

      for (const winkel of winkels) {
        const match = winkel.link.match(/shop_id=(\d+)/i);
        if (!match) continue;
        const id = match[1];

        const huidigeWinkel = winkelUrl.find((y) => y.shopnr == id);

        mogelijkeWinkels.push({
          name_short: winkel.name_short,
          shop_name: winkel.name_long,
          orig_url: huidigeWinkel && huidigeWinkel.url ? huidigeWinkel.url : "",
          link: `https://www.sponsorkliks.com/link.php?club=${Constants.CLUB_ID}&shop_id=${id}&src=brexsc&code=${Constants.API_CODE}`,
        });
      }
    } catch (e) {
      console.log("[SPONSOREXTENSIE] de lijst met winkels kon niet worden opgehaald bij sponsorkliks");
    }

    // Add custom targets that are not present in the API
    for (var url in Constants.CUSTOM_TARGETS) {
      var custom_data = Constants.CUSTOM_TARGETS[url];
      custom_data["orig_url"] = url;

      mogelijkeWinkels = mogelijkeWinkels.filter((w) => w.orig_url !== url);
      mogelijkeWinkels.push(custom_data);
    }

    mogelijkeWinkels = mogelijkeWinkels.filter((w) => Functions.extractHostname(w.orig_url) !== "www.sponsorkliks.com");

    browser.storage.local.set({
      [Constants.URLS_KEY]: mogelijkeWinkels
        .filter((obj) => !!obj.orig_url)
        .reduce(function (map, obj) {
          map[Functions.extractHostname(obj.orig_url)] = obj;
          return map;
        }, {}),
    });
  }

  /**
  * Change the current website on the specified tab
  * @param tabId {number} id of the tab to change the website of
  * @param target {string} new website url
  */
  static navigateTo(tabId, target) {
    console.log("[SPONSOREXTENSIE] L73: de url wordt nu vervangen");
    browser.tabs.update(tabId, { url: target });
    console.log("[SPONSOREXTENSIE] L75: de url is vervangen door " + target);
  }

  /**
  * Show page action and notification for website which has an affiliate link
  * @param link {string} affiliate link
  * @param tabId {number} tab id of the website
  * @param hostname {string} hostname of the website
  * @param referrer {string} url of the website to redirect to after redirect from sponsorkliks.nl
  * @param notificationTitle {string} title of the notification
  */
  static enableLinking(link, tabId, hostname, referrer, notificationTitle) {

    // Page action
    //browser.action.setPopup({tabId: tabId, popup: browser.runtime.getURL("src/popup.html")});
    browser.action.onClicked.addListener(function () {
      sponsortabs[tabId] = { hostname: hostname, referrer: referrer };
      browser.notifications.clear(Constants.NOTIFICATION_ID);
      Functions.navigateTo(tabId, link);
    });

    // Notification
    browser.notifications.create(
      Constants.NOTIFICATION_ID + tabId,
      {
        type: "basic",
        title: notificationTitle,
        message:
          "Klik op deze notificatie of de icoon van de extensie om via die link te gaan.",
        iconUrl: browser.runtime.getURL("icons/icon128.png"),
      },
      function (nId) { }
    );

    browser.notifications.onClicked.addListener(function (notificationId) {
      if (notificationId === Constants.NOTIFICATION_ID + tabId) {
        sponsortabs[tabId] = { hostname: hostname, referrer: referrer };
        browser.notifications.clear(notificationId);
        Functions.navigateTo(tabId, link);
      }
    });
  }

  /**
  * Called when a user navigates to an url
  * @param event {object}
  */
  navigationCompleteListener(event) {
    console.log("Nieuwe url: " + event.url);
    Functions.getStorage([Constants.URLS_KEY, Constants.ALWAYS_REDIRECT_KEY], (storage) => {
      const tabId = event.tabId;
      const url = event.url;
      const hostname = Functions.extractHostname(url);
      const nowww_hostname = hostname.replace(/^(www\.)/, "");

      // If there is no hostname found: return
      if (!hostname) {
        return;
      }

      const urls = storage[Constants.URLS_KEY];
      if (!urls) {
        // Apparently we were not able to retrieve the urls from the API yet
        return;
      }
      const target = urls[hostname] || urls[nowww_hostname];

      // If we're not on a sponsored link capable page: return
      if (!target) {
        return;
      }

      // Check if we're still visiting the same site we already went through a sponsored link for
      if (sponsortabs[tabId] && hostname === sponsortabs[tabId]["hostname"]) {
        // If we have a origin location we came for, redirect back to that page
        if (sponsortabs[tabId]["referrer"]) {
          Functions.navigateTo(tabId, sponsortabs[tabId]["referrer"]);
          sponsortabs[tabId]["referrer"] = null;
        }
        return;
      }

      if (storage[Constants.ALWAYS_REDIRECT_KEY]) {
        // Immediately redirect to the affiliated link
        console.log("[SPONSOREXTENSIE] L154: je wordt altijd automatisch doorgestuurd voor deze website");
        sponsortabs[tabId] = { hostname: hostname, referrer: url };
        Functions.navigateTo(tabId, target["link"]);
      } else {
        console.log("[SPONSOREXTENSIE] L158: je hoort nu een melding te krijgen");
        Functions.enableLinking(
          target["link"],
          tabId,
          hostname,
          url,
          target["name_short"] + " heeft ook een gesponsorde link!"
        );
      }
    });
  }

  /**
  * Extract the hostname from a full url
  * Examples:
  * http://www.google.com/search?q=example => www.google.com
  * https://example.com?example => example.com
  * @param url {string} full url
  * @returns {string} url with the protocol, path and get parameters stripped
  */
  static extractHostname(url) {
    //find & remove protocol (http, ftp, etc.) and get hostname, then find & remove "?"
    return (
      url.indexOf("://") > -1 ? url.split("/")[2] : url.split("/")[0]
    ).split("?")[0];
  }

  /**
  * Get object(s) from local storage
  * If the second parameter is not set, the first parameter will be used as callback
  * and all objects will be retrieved instead of just the one specified by the key
  * @param key {string|string[]=} object(s) to get from storage
  * @param callback {function} function to call when the object(s) has/have loaded
  */
  static getStorage(key, callback) {
    if (!callback || typeof callback !== "function") {
      callback = key;
      key = false;
    }

    const promise = key
      ? browser.storage.local.get(key)
      : browser.storage.local.get();
    promise.then(callback);
  }

  /**
  * Return the unix timestamp of 1 day ago
  * @returns {number} unix timestamp in seconds
  */
  static unixDayAgo() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return Functions.unixTime(d);
  }

  /**
  * Convert Date object to unix time in seconds
  * @param date {Date} Date object
  * @returns {number} unix time in seconds
  */
  static unixTime(date) {
    return Math.round(date.getTime() / 1000);
  };
}
