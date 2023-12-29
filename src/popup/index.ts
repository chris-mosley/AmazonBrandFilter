import { getManifest, getMessage, getStorageValue, setIcon, setStorageValue } from "utils/helpers";

const abfEnabled = document.getElementById("abf-enabled")! as HTMLInputElement;
const abfFilterRefiner = document.getElementById("abf-filter-refiner")! as HTMLInputElement;
const abfFilterRefinerHide = document.getElementById("abf-filter-refiner-hide")! as HTMLInputElement;
const abfFilterRefinerGrey = document.getElementById("abf-filter-refiner-grey")! as HTMLInputElement;
const abfAllowRefineBypass = document.getElementById("abf-allow-refine-bypass")! as HTMLInputElement;
const abfDebugMode = document.getElementById("abf-debug-mode")! as HTMLInputElement;
const abfPersonalBlockEnabled = document.getElementById("abf-personal-block-enabled")! as HTMLInputElement;
const abfPersonalBlockTextBox = document.getElementById("abf-personal-block-textbox")! as HTMLTextAreaElement;
const abfPersonalBlockButton = document.getElementById("abf-personal-block-button")! as HTMLButtonElement;
const abfVersion = document.getElementById("abf-version")! as HTMLSpanElement;
// const abfHideAll = document.getElementById("abf-hideall")! as HTMLButtonElement;
const abfPersonalBlockSavedConfirm = document.getElementById("abf-personal-block-saved-confirm")! as HTMLSpanElement;
const versionNumber = document.getElementById("version-number")! as HTMLSpanElement;
const brandCount = document.getElementById("brand-count")! as HTMLSpanElement;
const lastRun = document.getElementById("last-run")! as HTMLSpanElement;

const abfEnabledText = document.getElementById("abf-enabled-text")! as HTMLInputElement;
const abfFilterRefinerText = document.getElementById("abf-filter-refiner-text")! as HTMLInputElement;
const abfFilterRefinerHideText = document.getElementById("abf-filter-refiner-hide-text")! as HTMLInputElement;
const abfFilterRefinerGreyText = document.getElementById("abf-filter-refiner-grey-text")! as HTMLInputElement;
const abfAllowRefineBypassText = document.getElementById("abf-allow-refine-bypass-text")! as HTMLInputElement;
const abfDebugModeText = document.getElementById("abf-debug-mode-text")! as HTMLInputElement;
const abfPersonalBlockEnabledText = document.getElementById("abf-personal-block-enabled-text")! as HTMLInputElement;

const abfPersonalBlockSavedConfirmText = document.getElementById("abf-personal-block-saved-confirm")! as HTMLSpanElement;
const brandListVersionText = document.getElementById("popup-brand-version-text")! as HTMLSpanElement;
const brandCountText = document.getElementById("popup-brand-count-text")! as HTMLSpanElement;
const feedbackText = document.getElementById("popup-feedback-text")! as HTMLSpanElement;
const missingBrandText = document.getElementById("popup-missing-brand-text")! as HTMLSpanElement;
const lastRunText = document.getElementById("last-run")! as HTMLSpanElement;


const setText = async () => {
  // these have to be snake_case because chrome doesnt support hyphens in i18n
  abfEnabledText.innerText = await getMessage("popup_enabled");
  abfFilterRefinerText.innerText = await getMessage("popup_filter_sidebar");
  abfFilterRefinerHideText.innerText = await getMessage("popup_sidebar_hide");
  abfFilterRefinerGreyText.innerText = await getMessage("popup_sidebar_grey");
  abfAllowRefineBypassText.innerText = await getMessage("popup_allow_refine_bypass");
  abfDebugModeText.innerText = await getMessage("popup_debug");
  abfPersonalBlockEnabledText.innerText = await getMessage("popup_personal_blocklist");
  abfPersonalBlockButton.innerText = await getMessage("popup_save_button");
  
  abfPersonalBlockSavedConfirmText.innerText = await getMessage("popup_save_confirm");
  brandListVersionText.innerText = await getMessage("popup_list_version");
  brandCountText.innerText = await getMessage("popup_list_count");
  feedbackText.innerText = await getMessage("popup_feedback_link");
  missingBrandText.innerText = await getMessage("popup_missing_brand");
  lastRunText.innerText = await getMessage("popup_last_run");

}


const setPopupBoxStates = async () => {
  console.log("AmazonBrandFilter: Setting Popup Box States");
  const settings = await getStorageValue("local");
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

  if (settings.refinerMode == "grey") {
    abfFilterRefinerGrey.checked = true;
    abfFilterRefinerHide.checked = false;
  } else {
    abfFilterRefinerHide.checked = true;
    abfFilterRefinerGrey.checked = false;
  }

  setIcon();
  versionNumber.innerText = settings.brandsVersion.toString();
  brandCount.innerText = settings.brandsCount.toString();
  if (settings.lastMapRun != null) {
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
  if (syncSettings.usePersonalBlock == true) {
    abfPersonalBlockEnabled.checked = true;
    abfPersonalBlockTextBox.style.display = "block";
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
    abfPersonalBlockTextBox.style.overflow = "scroll";
  }

  abfPersonalBlockTextBox.value = textValue.join("\n");
  abfPersonalBlockTextBox.rows = textHeight;
};

const getSanitizedUserInput = () => {
  // god so much santization to do here
  const userInput = abfPersonalBlockTextBox.value.split("\n");
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
    abfPersonalBlockTextBox.style.display = "block";
    abfPersonalBlockButton.style.display = "block";
  } else {
    setStorageValue({ usePersonalBlock: false }, "sync");
    abfPersonalBlockTextBox.style.display = "none";
    abfPersonalBlockButton.style.display = "none";
  }
};

setPopupBoxStates();
setTextBoxStates();
setText();
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
