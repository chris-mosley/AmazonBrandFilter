import { browser } from "webextension-polyfill-ts";

console.log("AmazonBrandFilter: Starting popup.js");

const abfEnabled = document.getElementById("abf-enabled")! as HTMLInputElement;
const abfFilterRefiner = document.getElementById("abf-filter-refiner")! as HTMLInputElement;
const abfFilterRefinerHide = document.getElementById("abf-filter-refiner-hide")! as HTMLInputElement;
const abfFilterRefinerGrey = document.getElementById("abf-filter-refiner-grey")! as HTMLInputElement;
const abfAllowRefineBypass = document.getElementById("abf-allow-refine-bypass")! as HTMLInputElement;
const abfDebugMode = document.getElementById("abf-debug-mode")! as HTMLInputElement;
const abfPersonalBlockEnabled = document.getElementById("abf-personal-block-enabled")! as HTMLInputElement;
const abfPersonalBlockText = document.getElementById("abf-personal-block-text")! as HTMLTextAreaElement;
const abfPersonalBlockButton = document.getElementById("abf-personal-block-button")! as HTMLButtonElement;
const abfVersion = document.getElementById("abf-version")! as HTMLSpanElement;
// const abfHideAll = document.getElementById("abf-hideall")! as HTMLButtonElement;
const abfPersonalBlockSavedConfirm = document.getElementById("abf-personal-block-saved-confirm")! as HTMLSpanElement;
const versionNumber = document.getElementById("version-number")! as HTMLSpanElement;
const brandCount = document.getElementById("brand-count")! as HTMLSpanElement;
const lastRun = document.getElementById("last-run")! as HTMLSpanElement;

const setPopupBoxStates = async () => {
  console.log("AmazonBrandFilter: Setting Popup Box States");
  const settings = await browser.storage.local.get();
  console.log("AmazonBrandFilter: abfSettings is " + JSON.stringify(settings));
  if (settings.enabled) {
    console.log("AmazonBrandFilter: abfSettings.enabled is enabled");
    abfEnabled.checked = true;
  } else {
    console.log("AmazonBrandFilter: abfSettings is not enabled");
    abfEnabled.checked = false;
  }

  if (settings.filterRefiner) {
    console.log("AmazonBrandFilter: abfSettings.filterRefiner is enabled");
    abfFilterRefiner.checked = true;
  } else {
    console.log("AmazonBrandFilter: abfSettings.filterRefiner is not enabled");
    abfFilterRefiner.checked = false;
  }

  if (settings.refinerBypass) {
    console.log("AmazonBrandFilter: abfSettings.filterRefiner is enabled");
    abfAllowRefineBypass.checked = true;
  } else {
    console.log("AmazonBrandFilter: abfSettings.filterRefiner is not enabled");
    abfAllowRefineBypass.checked = false;
  }

  if (settings.refinerMode == "grey") {
    console.log("AmazonBrandFilter: abfSettings.refinerMode is grey");
    abfFilterRefinerGrey.checked = true;
    abfFilterRefinerHide.checked = false;
  } else {
    console.log("AmazonBrandFilter: abfSettings.refinerMode is hide");
    abfFilterRefinerHide.checked = true;
    abfFilterRefinerGrey.checked = false;
  }

  setIcon();
  versionNumber.innerText = settings.brandsVersion;
  brandCount.innerText = settings.brandsCount;
  if (settings.lastMapRun != null) {
    lastRun.innerText = settings.lastMapRun + "ms";
  } else {
    lastRun.innerText = "N/A";
  }

  if (settings.debugMode) {
    console.log("AmazonBrandFilter: abfSettings.debugMode is enabled");
    abfDebugMode.checked = true;
  }
};

const setAddonVersion = () => {
  const manifest = browser.runtime.getManifest();
  abfVersion.innerText = "v" + manifest.version;
};

const setIcon = async () => {
  const result = await browser.storage.local.get("enabled");
  console.log("AmazonBrandFilter: abfSettings.enabled bool eval: " + JSON.stringify(result.enabled));
  if (result.enabled == true) {
    console.log("AmazonBrandFilter: setting icon to enabled");
    browser.action.setIcon({
      path: {
        48: "../icons/abf-enabled-128.png",
      },
    });
  } else {
    console.log("AmazonBrandFilter: setting icon to disabled");
    browser.action.setIcon({
      path: {
        48: "../icons/abf-disabled-128.png",
      },
    });
  }
};

const setTextBoxStates = async () => {
  const syncSettings = await browser.storage.sync.get();
  if (syncSettings.usePersonalBlock == true) {
    console.log("AmazonBrandFilter: usePersonalBlock is true");
    abfPersonalBlockEnabled.checked = true;
    abfPersonalBlockText.style.display = "block";
    abfPersonalBlockButton.style.display = "block";
  }
};

const enableDisable = async (_event: Event) => {
  if (abfEnabled.checked) {
    browser.storage.local.set({ enabled: true });
  } else {
    const tab = await getCurrentTab();
    console.log(tab);
    browser.storage.local.set({ enabled: false });
  }

  browser.storage.local.get("enabled").then((result) => {
    console.log("enabled: " + result.enabled);
  });
  setIcon();
};

const setFilterRefiner = (_event: Event) => {
  if (abfFilterRefiner.checked) {
    browser.storage.local.set({ filterRefiner: true });
  } else {
    browser.storage.local.set({ filterRefiner: false });
  }

  browser.storage.local.get("filterRefiner").then((result) => {
    console.log("filterRefiner: " + result.filterRefiner);
  });
};

const setRefinerHide = (_event: Event) => {
  if (abfFilterRefinerHide.checked) {
    browser.storage.local.set({ refinerMode: "hide" });
    abfFilterRefinerGrey.checked = false;
  } else {
    browser.storage.local.set({ refinerMode: "grey" });
  }

  browser.storage.local.get("refinerMode").then((result) => {
    console.log("refinerMode: " + result.refinerMode);
  });
};

const setRefinerGrey = (_event: Event) => {
  if (abfFilterRefinerGrey.checked) {
    browser.storage.local.set({ refinerMode: "grey" });
    abfFilterRefinerHide.checked = false;
  } else {
    browser.storage.local.set({ refinerMode: "hide" });
  }

  browser.storage.local.get("refinerMode").then((result) => {
    console.log("refinerMode: " + result.refinerMode);
  });
};

const setRefinerBypass = (_event: Event) => {
  if (abfAllowRefineBypass.checked) {
    browser.storage.local.set({ refinerBypass: true });
  } else {
    browser.storage.local.set({ refinerBypass: false });
  }

  browser.storage.local.get("refinerBypass").then((result) => {
    console.log("refinerBypass: " + result.refinerBypass);
  });
};

const setDebugMode = (_event: Event) => {
  if (abfDebugMode.checked) {
    browser.storage.local.set({ debugMode: true });
  } else {
    browser.storage.local.set({ debugMode: false });
  }

  browser.storage.local.get("debugMode").then((result) => {
    console.log("debugMode: " + result.debugMode);
  });
};

// const unHideDivs = () => {
//   const divs = getItemDivs();
//   for (const div of divs) {
//     div.style.display = "block";
//   }
// }

// const logCurrentTab = async () => {
//   const tab = await getCurrentTab();
//   console.log(tab);
// }

const getCurrentTab = () => {
  console.log("AmazonBrandFilter: Starting getCurrentTab");
  const tab = browser.tabs.query({ currentWindow: true, active: true });
  return tab;
};

// const addBorder = () => {
//   document.border = "5px solid red";
// }

// const addBorderToTab = async () => {
//   const tab = await getCurrentTab();
//   const tabId = tab[0].id;
//   if (!tabId) {
//     return;
//   }
//   console.log(`tab is: ${tabId}`);
//   browser.scripting.executeScript({
//     func: filterBrands(),
//     files: ["content.js"],
//     injectImmediately: true,
//     target: { tabId: tabId },
//   });
// }

// const hideAll = async () => {
//   console.log("AmazonBrandFilter: Starting hideAll");
//   const tab = await getCurrentTab();
//   const tabId = tab[0].id;
//   if (!tabId) {
//     return;
//   }
//   console.log(`tab is: ${tabId}`);
//   browser.scripting.executeScript({
//     func: hideAllResults(),
//     files: ["../content.js"],
//     injectImmediately: true,
//     target: { tabId: tabId },
//   });
// }

const savePersonalBlock = async () => {
  const userInput = await getSanitizedUserInput();
  const personalBlockMap = new Map();
  for (const brand of userInput) {
    console.log("AmazonBrandFilter: adding brand: " + brand);
    personalBlockMap.set(brand, true);
  }
  console.log("AmazonBrandFilter: personalBlockMap is: " + JSON.stringify(personalBlockMap));
  browser.storage.sync.set({ personalBlockMap: personalBlockMap });
  abfPersonalBlockSavedConfirm.style.display = "block";
};

const setPersonalList = async () => {
  let personalBlockMap = await browser.storage.sync.get("personalBlockMap");
  personalBlockMap = personalBlockMap.personalBlockMap;

  if (personalBlockMap == undefined) {
    console.log("AmazonBrandFilter: personalBrandsMap is undefined");
    return;
  }
  console.log("AmazonBrandFilter: personalBrandsMap is: " + JSON.stringify(personalBlockMap));
  if (personalBlockMap == undefined) {
    return;
  }

  console.log("personalBlockMap keys are: " + Object.keys(personalBlockMap));
  const textValue = Object.keys(personalBlockMap);
  let textHeight = Object.keys(personalBlockMap).length;
  if (textHeight > 10) {
    textHeight = 10;
    abfPersonalBlockText.style.overflow = "scroll";
  }

  console.log("AmazonBrandFilter: setting personal block list text area to: " + textValue.join("\n"));
  abfPersonalBlockText.value = textValue.join("\n");
  abfPersonalBlockText.rows = textHeight;
};

const getSanitizedUserInput = () => {
  // god so much santization to do here
  const userInput = abfPersonalBlockText.value.split("\n");
  console.log(userInput);
  const sanitizedInput = [];
  for (const line of userInput) {
    // we'll come up with something smarter later.
    if (line == "" || line == " " || line == "\n" || line == "\r\n" || line == "\r") {
      continue;
    }
    sanitizedInput.push(line.toUpperCase());
  }
  return sanitizedInput;
};

const setPersonalBlockEnabled = () => {
  if (abfPersonalBlockEnabled.checked) {
    browser.storage.sync.set({ usePersonalBlock: true });
    abfPersonalBlockText.style.display = "block";
    abfPersonalBlockButton.style.display = "block";
  } else {
    browser.storage.sync.set({ usePersonalBlock: false });
    abfPersonalBlockText.style.display = "none";
    abfPersonalBlockButton.style.display = "none";
  }

  browser.storage.sync.get("usePersonalBlock").then((result) => {
    console.log("personalBlockEnabled: " + result.usePersonalBlock);
  });
};

// const getSettings = async (location: string) => {
//   let settings;
//   if (location == "sync") {
//     settings = await browser.storage.sync.get().then((result) => {
//       console.log("AmazonBrandFilter: sync settings are: " + JSON.stringify(result));
//     });
//   } else {
//     settings = await browser.storage.local.get().then((result) => {
//       console.log("AmazonBrandFilter: local settings are: " + JSON.stringify(result));
//     });
//   }
//   return settings;
// }

setPopupBoxStates();
setTextBoxStates();
setAddonVersion();
setPersonalList();
// abfEnabled.checked = true

abfEnabled.addEventListener("click", enableDisable);
abfFilterRefiner.addEventListener("click", setFilterRefiner);
abfFilterRefinerHide.addEventListener("click", setRefinerHide);
abfFilterRefinerGrey.addEventListener("click", setRefinerGrey);
abfAllowRefineBypass.addEventListener("click", setRefinerBypass);
abfDebugMode.addEventListener("click", setDebugMode);
abfPersonalBlockEnabled.addEventListener("click", setPersonalBlockEnabled);
abfPersonalBlockButton.addEventListener("click", savePersonalBlock);
// abfHideAll.addEventListener("click", hideAll)
