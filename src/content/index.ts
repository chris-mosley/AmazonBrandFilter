import { runFilter } from "content/filter";
import { injectElements } from "content/inject";
import { listenForMessages, notifyBackgroundScript } from "content/messaging";
import { startObserver } from "content/observer";
import { ensureSettingsExist } from "utils/browser-helpers";
import { unHideDivs } from "utils/helpers";

(async () => {
  injectElements();
  unHideDivs();
  await ensureSettingsExist();
  runFilter();
  listenForMessages();
  notifyBackgroundScript({ type: "contentLoaded" });
  startObserver();
  console.log("AmazonBrandFilter: %cContent script loaded!", "color: lightgreen");
})();
