import { getCurrentTab, getManifest, getStorageValue, setIcon, setStorageValue } from "utils/helpers";

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
  const settings = await getStorageValue(undefined, "sync");
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
  const manifest = getManifest();
  abfVersion.innerText = "v" + manifest.version;
};

const setTextBoxStates = async () => {
  const syncSettings = await getStorageValue(undefined, "sync");
  if (syncSettings.usePersonalBlock == true) {
    console.log("AmazonBrandFilter: usePersonalBlock is true");
    abfPersonalBlockEnabled.checked = true;
    abfPersonalBlockText.style.display = "block";
    abfPersonalBlockButton.style.display = "block";
  }
};

const enableDisable = async (_event: Event) => {
  if (abfEnabled.checked) {
    setStorageValue({ enabled: true });
  } else {
    const tab = await getCurrentTab();
    console.log(tab);
    setStorageValue({ enabled: false });
  }

  getStorageValue("enabled").then((result) => {
    console.log("enabled: " + result.enabled);
  });
  setIcon();
};

const setFilterRefiner = (_event: Event) => {
  if (abfFilterRefiner.checked) {
    setStorageValue({ filterRefiner: true });
  } else {
    setStorageValue({ filterRefiner: false });
  }

  getStorageValue("filterRefiner").then((result) => {
    console.log("filterRefiner: " + result.filterRefiner);
  });
};

const setRefinerHide = (_event: Event) => {
  if (abfFilterRefinerHide.checked) {
    setStorageValue({ refinerMode: "hide" });
    abfFilterRefinerGrey.checked = false;
  } else {
    setStorageValue({ refinerMode: "grey" });
  }

  getStorageValue("refinerMode").then((result) => {
    console.log("refinerMode: " + result.refinerMode);
  });
};

const setRefinerGrey = (_event: Event) => {
  if (abfFilterRefinerGrey.checked) {
    setStorageValue({ refinerMode: "grey" });
    abfFilterRefinerHide.checked = false;
  } else {
    setStorageValue({ refinerMode: "hide" });
  }

  getStorageValue("refinerMode").then((result) => {
    console.log("refinerMode: " + result.refinerMode);
  });
};

const setRefinerBypass = (_event: Event) => {
  if (abfAllowRefineBypass.checked) {
    setStorageValue({ refinerBypass: true });
  } else {
    setStorageValue({ refinerBypass: false });
  }

  getStorageValue("refinerBypass").then((result) => {
    console.log("refinerBypass: " + result.refinerBypass);
  });
};

const setDebugMode = (_event: Event) => {
  if (abfDebugMode.checked) {
    setStorageValue({ debugMode: true });
  } else {
    setStorageValue({ debugMode: false });
  }

  getStorageValue("debugMode").then((result) => {
    console.log("debugMode: " + result.debugMode);
  });
};

const savePersonalBlock = async () => {
  const userInput = getSanitizedUserInput();
  const personalBlockMap = new Map();
  for (const brand of userInput) {
    console.log("AmazonBrandFilter: adding brand: " + brand);
    personalBlockMap.set(brand, true);
  }
  console.log("AmazonBrandFilter: personalBlockMap is: " + JSON.stringify(personalBlockMap));
  setStorageValue({ personalBlockMap }, "sync");
  abfPersonalBlockSavedConfirm.style.display = "block";
};

const setPersonalList = async () => {
  let personalBlockMap = await getStorageValue("personalBlockMap", "sync");
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
    setStorageValue({ usePersonalBlock: true }, "sync");
    abfPersonalBlockText.style.display = "block";
    abfPersonalBlockButton.style.display = "block";
  } else {
    setStorageValue({ usePersonalBlock: false }, "sync");
    abfPersonalBlockText.style.display = "none";
    abfPersonalBlockButton.style.display = "none";
  }

  getStorageValue("usePersonalBlock", "sync").then((result) => {
    console.log("personalBlockEnabled: " + result.usePersonalBlock);
  });
};

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
