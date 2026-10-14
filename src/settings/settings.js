import Constants from "../constants.js";
import Functions from "../functions.js"

/**
 * Called when the DOM is loaded
 * Restores the saved settings
 */
function restoreOptions() {
  Functions.getStorage(Constants.ALWAYS_REDIRECT_KEY, (storage) => {
    if (storage[Constants.ALWAYS_REDIRECT_KEY]) {
      document.getElementById("always-redirect").checked = true;
    }
  });
}
document.addEventListener("DOMContentLoaded", restoreOptions);

/**
 * Called when the form is submitted
 * @param e {object} submit event
 */
function saveOptions(e) {
  e.preventDefault();

  browser.storage.local.set({
    [Constants.ALWAYS_REDIRECT_KEY]:
      document.getElementById("always-redirect").checked,
  });

  const settingsSaved = document.getElementById("settings-saved");
  settingsSaved.innerHTML = "Wijzigingen opgeslagen";
  setTimeout(function () {
    settingsSaved.innerText = "";
  }, 1000);
}
document
  .getElementById("always-redirect")
  .addEventListener("change", saveOptions);
