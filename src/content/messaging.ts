import { filterBrands, resetBrands, resetBrandsRefiner, runFilterRefiner } from "content/filter";
import { sendRuntimeMessage } from "utils/browser-helpers";
import { unHideDivs } from "utils/helpers";
import { ContentMessage, PopupMessage } from "utils/types";

export const messageListener = async (event: MessageEvent) => {
  const toggleIframe = document.getElementById("abf-toggle-iframe") as HTMLIFrameElement | null;
  // TODO: may neede to alter message.type a little as some may be too broad
  const message: PopupMessage = event.data;
  switch (message.type) {
    case "enabled":
      if (message.isChecked) {
        filterBrands();
      } else {
        resetBrands();
        // previously hidden elements should be shown
        unHideDivs();
      }
      toggleIframe?.contentWindow?.postMessage({ type: "enabled", isChecked: message.isChecked }, "*");
      break;
    case "refinerBypass":
      if (message.isChecked) {
        resetBrands();
        // previously hidden elements should be shown
        unHideDivs();
      } else {
        filterBrands();
      }
      break;
    case "useDebugMode":
      filterBrands();
      break;
    case "filterRefiner":
      resetBrandsRefiner();
      runFilterRefiner();
      break;
    case "refinerMode":
      runFilterRefiner();
      break;
    case "usePersonalBlock":
    case "personalBlockMap":
      filterBrands();
      break;
    default:
      break;
  }
};

export const listenForMessages = () => {
  console.log("AmazonBrandFilter: %cListening for messages!", "color: lightgreen");
  window.addEventListener("message", messageListener);
};

export const notifyBackgroundScript = (message: ContentMessage) => {
  sendRuntimeMessage(message);
  console.log("AmazonBrandFilter: %cNotified background script!", "color: lightgreen");
};

window.addEventListener("unload", () => {
  notifyBackgroundScript({ type: "contentUnloaded" });
  window.removeEventListener("message", messageListener);
  console.log("AmazonBrandFilter: %cContent script unloaded!", "color: lightcoral");
});
