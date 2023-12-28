import { getManifest, getStorageValue, setIcon, setStorageValue } from "utils/helpers";

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
  const settings = await getStorageValue("sync");
  console.log("AmazonBrandFilter: abfSettings is " + JSON.stringify(settings));
  if (settings.enabled) {
    abfEnabled.checked = true;
  } else {
    abfEnabled.checked = false;
  }

  if (settings.filterRefiner) {
    abfFilterRefiner.checked = true;
  } else {
    abfFilterRefiner.checked = false;
  }

  if (settings.refinerBypass) {
    abfAllowRefineBypass.checked = true;
  } else {
    abfAllowRefineBypass.checked = false;
  }

  if (settings.refinerMode === "grey") {
    abfFilterRefinerGrey.checked = true;
    abfFilterRefinerHide.checked = false;
  } else {
    abfFilterRefinerHide.checked = true;
    abfFilterRefinerGrey.checked = false;
  }

  setIcon();
  versionNumber.innerText = settings.brandsVersion.toString();
  brandCount.innerText = settings.brandsCount.toString();
  if (settings.lastMapRun) {
    lastRun.innerText = settings.lastMapRun + "ms";
  } else {
    lastRun.innerText = "N/A";
  }

  if (settings.useDebugMode) {
    abfDebugMode.checked = true;
  }
};

const setAddonVersion = () => {
  const manifest = getManifest();
  abfVersion.innerText = "v" + manifest.version;
};

const setTextBoxStates = async () => {
  const syncSettings = await getStorageValue("sync");
  if (syncSettings.usePersonalBlock === true) {
    abfPersonalBlockEnabled.checked = true;
    abfPersonalBlockText.style.display = "block";
    abfPersonalBlockButton.style.display = "block";
  }
};

const enableDisable = async (_event: Event) => {
  if (abfEnabled.checked) {
    setStorageValue({ enabled: true });
  } else {
    setStorageValue({ enabled: false });
  }
  setIcon();
};

const setFilterRefiner = (_event: Event) => {
  if (abfFilterRefiner.checked) {
    setStorageValue({ filterRefiner: true });
  } else {
    setStorageValue({ filterRefiner: false });
  }
};

const setRefinerHide = (_event: Event) => {
  if (abfFilterRefinerHide.checked) {
    setStorageValue({ refinerMode: "hide" });
    abfFilterRefinerGrey.checked = false;
  } else {
    setStorageValue({ refinerMode: "grey" });
  }
};

const setRefinerGrey = (_event: Event) => {
  if (abfFilterRefinerGrey.checked) {
    setStorageValue({ refinerMode: "grey" });
    abfFilterRefinerHide.checked = false;
  } else {
    setStorageValue({ refinerMode: "hide" });
  }
};

const setRefinerBypass = (_event: Event) => {
  if (abfAllowRefineBypass.checked) {
    setStorageValue({ refinerBypass: true });
  } else {
    setStorageValue({ refinerBypass: false });
  }
};

const setDebugMode = (_event: Event) => {
  if (abfDebugMode.checked) {
    setStorageValue({ useDebugMode: true });
  } else {
    setStorageValue({ useDebugMode: false });
  }
};

const savePersonalBlock = async () => {
  const userInput = getSanitizedUserInput();
  const personalBlockMap = new Map();
  for (const brand of userInput) {
    personalBlockMap.set(brand, true);
  }
  console.log("AmazonBrandFilter: personalBlockMap is: " + JSON.stringify(personalBlockMap));
  setStorageValue({ personalBlockMap }, "sync");
  abfPersonalBlockSavedConfirm.style.display = "block";
};

const setPersonalList = async () => {
  let personalBlockMap = await getStorageValue("personalBlockMap", "sync");
  personalBlockMap = personalBlockMap.personalBlockMap;
  if (!personalBlockMap) {
    return;
  }

  const textValue = Object.keys(personalBlockMap);
  let textHeight = Object.keys(personalBlockMap).length;
  if (textHeight > 10) {
    textHeight = 10;
    abfPersonalBlockText.style.overflow = "scroll";
  }

  abfPersonalBlockText.value = textValue.join("\n");
  abfPersonalBlockText.rows = textHeight;
};

const getSanitizedUserInput = () => {
  // god so much santization to do here
  const userInput = abfPersonalBlockText.value.split("\n");
  const sanitizedInput = [];
  for (const line of userInput) {
    // we'll come up with something smarter later.
    if (line === "" || line === " " || line === "\n" || line === "\r\n" || line === "\r") {
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
