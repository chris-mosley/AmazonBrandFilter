import {
  ensureSettingsExist,
  getEngineApi,
  getManifest,
  getMessage,
  getSettings,
  getStorageValue,
  setIcon,
  setStorageValue,
} from "utils/browser-helpers";
import { getSanitizedUserInput } from "utils/helpers";
import { PopupMessage, GuiLocation } from "utils/types";

var guiLocation: GuiLocation = "popup";
if (location.pathname === "/dashboard.html") {
  guiLocation = "dashboard";
}

// checkboxes
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
const abfPersonalBlockSavedConfirm = document.getElementById("abf-personal-block-saved-confirm")! as HTMLSpanElement;
const abfSearchDepthSavedConfirm = document.getElementById("abf-search-depth-saved-confirm")! as HTMLSpanElement;
const abfFilterWithRefiner = document.getElementById("abf-use-filter-with-refiner")! as HTMLInputElement;

// numbers
const versionNumber = document.getElementById("version-number")! as HTMLSpanElement;
const brandCount = document.getElementById("brand-count")! as HTMLSpanElement;
const seenBrandCount = document.getElementById("seen-brand-count")! as HTMLSpanElement;
const lastRun = document.getElementById("last-run")! as HTMLSpanElement;
const abfSearchDepth = document.getElementById("abf-search-depth")! as HTMLInputElement;
// buttons

const knownBrandViewControlButton = document.getElementById("abf-known-brand-view-control")! as HTMLButtonElement;
const seenBrandViewControlButton = document.getElementById("abf-seen-brand-view-control")! as HTMLButtonElement;
const abfSaveSearchDepthButton = document.getElementById("abf-save-search-depth-button")! as HTMLButtonElement;
// text
const abfKnownBrandsListDiv = document.getElementById("abf-dashboard-known-brands")! as HTMLTextAreaElement;
const abfSeenBrandsListDiv = document.getElementById("abf-dashboard-seen-brands")! as HTMLTextAreaElement;
const abfSearchDepthText = document.getElementById("abf-search-depth-text")! as HTMLTextAreaElement;

const abfEnabledText = document.getElementById("abf-enabled-text")! as HTMLInputElement;
const abfFilterRefinerText = document.getElementById("abf-filter-refiner-text")! as HTMLInputElement;
const abfFilterRefinerHideText = document.getElementById("abf-filter-refiner-hide-text")! as HTMLInputElement;
const abfFilterRefinerGreyText = document.getElementById("abf-filter-refiner-grey-text")! as HTMLInputElement;
const abfAllowRefineBypassText = document.getElementById("abf-allow-refine-bypass-text")! as HTMLInputElement;
const abfDebugModeText = document.getElementById("abf-debug-mode-text")! as HTMLInputElement;
const abfPersonalBlockEnabledText = document.getElementById("abf-personal-block-enabled-text")! as HTMLInputElement;

const abfPersonalBlockText = document.getElementById("abf-personal-block-saved-confirm")! as HTMLSpanElement;
const brandListVersionText = document.getElementById("brand-version-text")! as HTMLSpanElement;
const brandCountText = document.getElementById("brand-count-text")! as HTMLSpanElement;
const feedbackText = document.getElementById("popup-feedback-text")! as HTMLSpanElement;
const missingBrandText = document.getElementById("popup-missing-brand-text")! as HTMLSpanElement;
const lastRunText = document.getElementById("last-run")! as HTMLSpanElement;
const helptranslate = document.getElementById("popup-help-translate")! as HTMLSpanElement;
const dashboard = document.getElementById("popup-dashboard")! as HTMLSpanElement;

const abfFilterWithRefinerText = document.getElementById("abf-use-filter-with-refiner-text")! as HTMLInputElement;
const abfExperimentalFeatures = document.getElementById("abf-experimental-features")! as HTMLSpanElement;
const dashboardNotice = document.getElementById("dashboard-notice")! as HTMLInputElement;
const dashboardKnownBrandListText = document.getElementById("known-brands-list-text")! as HTMLInputElement;
const dashboardSeenBrandListText = document.getElementById("seen-brands-list-text")! as HTMLInputElement;
const setText = async (locationPath: GuiLocation) => {
  const { settings, syncSettings } = await getSettings();
  // these have to be snake_case because chrome doesnt support hyphens in i18n
  abfEnabledText.innerText = await getMessage("popup_enabled");
  abfEnabledText.title = await getMessage("popup_enabled_tooltip");
  abfFilterRefinerText.innerText = await getMessage("popup_filter_sidebar");
  abfFilterRefinerText.title = await getMessage("popup_filter_sidebar_tooltip");
  abfFilterRefinerHideText.innerText = await getMessage("popup_sidebar_hide");
  abfFilterRefinerHideText.title = await getMessage("popup_sidebar_hide_tooltip");
  abfFilterRefinerGreyText.innerText = await getMessage("popup_sidebar_grey");
  abfFilterRefinerGreyText.title = await getMessage("popup_sidebar_grey_tooltip");
  abfAllowRefineBypassText.innerText = await getMessage("popup_allow_refine_bypass");
  abfAllowRefineBypassText.title = await getMessage("popup_allow_refine_bypass_tooltip");

  abfDebugModeText.innerText = await getMessage("popup_debug");
  abfDebugModeText.title = await getMessage("popup_debug_tooltip");
  abfPersonalBlockEnabledText.innerText = await getMessage("popup_personal_blocklist");
  abfPersonalBlockEnabledText.title = await getMessage("popup_personal_blocklist_tooltip");
  abfPersonalBlockButton.value = await getMessage("save_button");
  abfPersonalBlockText.innerText = await getMessage("save_confirm");

  brandListVersionText.innerText = await getMessage("brand_list_version");

  feedbackText.innerText = await getMessage("popup_feedback_link");
  missingBrandText.innerText = await getMessage("popup_missing_brand");
  lastRunText.innerText = await getMessage("popup_last_run");
  helptranslate.innerText = await getMessage("popup_help_translate");

  if (locationPath === "dashboard") {
    abfFilterWithRefinerText.innerText = await getMessage("use_filter_with_refiner");
    abfFilterWithRefinerText.title = await getMessage("use_filter_with_refiner_tooltip");
    abfExperimentalFeatures.innerText = await getMessage("experimental_features");
    abfExperimentalFeatures.title = await getMessage("experimental_features_tooltip");
    dashboardKnownBrandListText.innerText = await getMessage("known_brands_list_text");
    abfSearchDepthText.innerText = await getMessage("search_depth");
    abfSearchDepthText.title = await getMessage("search_depth_tooltip");
    dashboardSeenBrandListText.innerText = await getMessage("seen_brands_list_text");
    seenBrandCount.innerText = settings.seenBrandCount?.toString() ?? "";
    abfSearchDepth.value = syncSettings.searchDepth.toString();
    abfSearchDepthSavedConfirm.innerText = await getMessage("save_confirm");
    abfSearchDepthSavedConfirm.style.display = "none";

    if (syncSettings.showKnownBrands === null) {
      if (settings.showKnownBrands) {
        knownBrandViewControlButton.value = await getMessage("hide_all");
        abfKnownBrandsListDiv.style.display = "block";
      } else {
        knownBrandViewControlButton.value = await getMessage("show_all");
        abfKnownBrandsListDiv.style.display = "none";
      }
    } else {
      if (syncSettings.showKnownBrands) {
        knownBrandViewControlButton.value = await getMessage("hide_all");
        abfKnownBrandsListDiv.style.display = "block";
      } else {
        knownBrandViewControlButton.value = await getMessage("show_all");
        abfKnownBrandsListDiv.style.display = "none";
      }
    }

    if (syncSettings.showSeenBrands === null) {
      if (settings.showSeenBrands) {
        seenBrandViewControlButton.value = await getMessage("hide_all");
        abfSeenBrandsListDiv.style.display = "block";
      } else {
        abfSeenBrandsListDiv.style.display = "none";
      }
    } else {
      if (syncSettings.showSeenBrands) {
        seenBrandViewControlButton.value = await getMessage("hide_all");
        abfSeenBrandsListDiv.style.display = "block";
      } else {
        seenBrandViewControlButton.value = await getMessage("show_all");
        abfSeenBrandsListDiv.style.display = "none";
      }
    }
  } else {
    brandCountText.innerText = await getMessage("brand_list_count");
    dashboard.innerText = await getMessage("popup_dashboard");
    dashboardNotice.innerText = await getMessage("dashboard_notice");
  }
};

const setCheckBoxStates = async (locationPath: GuiLocation) => {
  const { settings, syncSettings } = await getSettings();

  if (syncSettings.enabled) {
    abfEnabled.checked = true;
  } else {
    abfEnabled.checked = false;
  }

  if (syncSettings.filterRefiner) {
    abfFilterRefiner.checked = true;
  } else {
    abfFilterRefiner.checked = false;
  }

  if (syncSettings.refinerBypass) {
    abfAllowRefineBypass.checked = true;
  } else {
    abfAllowRefineBypass.checked = false;
  }

  if (syncSettings.refinerMode === "grey") {
    abfFilterRefinerGrey.checked = true;
    abfFilterRefinerHide.checked = false;
  } else {
    abfFilterRefinerHide.checked = true;
    abfFilterRefinerGrey.checked = false;
  }
  if (locationPath === "dashboard") {
    if (syncSettings.filterWithRefiner) {
      abfFilterWithRefiner.checked = true;
    } else {
      abfFilterWithRefiner.checked = false;
    }
  }

  versionNumber.innerText = settings.brandsVersion?.toString() ?? "";
  brandCount.innerText = settings.brandsCount?.toString() ?? "";

  if (syncSettings.lastMapRun) {
    lastRun.innerText = `${syncSettings.lastMapRun}ms`;
  } else {
    lastRun.innerText = "N/A";
  }

  if (syncSettings.useDebugMode) {
    abfDebugMode.checked = true;
  }

  setIcon();
};

const setAddonVersion = () => {
  const manifest = getManifest();
  abfVersion.innerText = `v${manifest.version}`;
};

const setTextBoxStates = async () => {
  const { syncSettings } = await getSettings();

  if (syncSettings.usePersonalBlock === true) {
    abfPersonalBlockEnabled.checked = true;
    abfPersonalBlockTextBox.style.display = "block";
    abfPersonalBlockButton.style.display = "block";
  }
};

const enableDisable = async (_event: Event) => {
  await setStorageValue({ enabled: abfEnabled.checked }, "sync");
  await setStorageValue({ enabled: abfEnabled.checked });
  await setIcon();
  sendMessageToContentScriptPostClick({ type: "enabled", isChecked: abfEnabled.checked });
};

const setFilterRefiner = async (_event: Event) => {
  await setStorageValue({ filterRefiner: abfFilterRefiner.checked }, "sync");
  await setStorageValue({ filterRefiner: abfFilterRefiner.checked });
  sendMessageToContentScriptPostClick({ type: "filterRefiner", isChecked: abfFilterRefiner.checked });
};

const setRefinerHide = async (_event: Event) => {
  abfFilterRefinerGrey.checked = !abfFilterRefinerHide.checked;
  await setStorageValue({ refinerMode: abfFilterRefinerHide.checked ? "hide" : "grey" }, "sync");
  await setStorageValue({ refinerMode: abfFilterRefinerHide.checked ? "hide" : "grey" });
  sendMessageToContentScriptPostClick({ type: "refinerMode", isChecked: abfFilterRefinerHide.checked });
};

const setRefinerGrey = async (_event: Event) => {
  abfFilterRefinerHide.checked = !abfFilterRefinerGrey.checked;
  await setStorageValue({ refinerMode: abfFilterRefinerGrey.checked ? "grey" : "hide" }, "sync");
  await setStorageValue({ refinerMode: abfFilterRefinerGrey.checked ? "grey" : "hide" });
  sendMessageToContentScriptPostClick({ type: "refinerMode", isChecked: abfFilterRefinerGrey.checked });
};

const setRefinerBypass = async (_event: Event) => {
  await setStorageValue({ refinerBypass: abfAllowRefineBypass.checked }, "sync");
  await setStorageValue({ refinerBypass: abfAllowRefineBypass.checked });
  sendMessageToContentScriptPostClick({ type: "refinerBypass", isChecked: abfAllowRefineBypass.checked });
};
const setFilterWithRefiner = async (_event: Event) => {
  await setStorageValue({ filterWithRefiner: abfFilterWithRefiner.checked }, "sync");
  await setStorageValue({ filterWithRefiner: abfFilterWithRefiner.checked });
  sendMessageToContentScriptPostClick({ type: "filterWithRefiner", isChecked: abfFilterWithRefiner.checked });
};

const setDebugMode = async (_event: Event) => {
  await setStorageValue({ useDebugMode: abfDebugMode.checked }, "sync");
  await setStorageValue({ useDebugMode: abfDebugMode.checked });
  sendMessageToContentScriptPostClick({ type: "useDebugMode", isChecked: abfDebugMode.checked });
};

const setPersonalBlockEnabled = async (_event: Event) => {
  abfPersonalBlockTextBox.style.display = abfPersonalBlockEnabled.checked ? "block" : "none";
  abfPersonalBlockButton.style.display = abfPersonalBlockEnabled.checked ? "block" : "none";
  await setStorageValue({ usePersonalBlock: abfPersonalBlockEnabled.checked }, "sync");
  await setStorageValue({ usePersonalBlock: abfPersonalBlockEnabled.checked });
  sendMessageToContentScriptPostClick({ type: "usePersonalBlock", isChecked: abfPersonalBlockEnabled.checked });
};

const savePersonalBlock = async () => {
  const userInput = getSanitizedUserInput(abfPersonalBlockTextBox.value);
  const personalBlockMap: Record<string, boolean> = {};
  for (const brand of userInput) {
    personalBlockMap[brand] = true;
  }
  await setStorageValue({ personalBlockMap }, "sync");
  await setStorageValue({ personalBlockMap });
  abfPersonalBlockSavedConfirm.style.display = "block";
  // use the same isChecked value as the personalBlockEnabled checkbox
  sendMessageToContentScriptPostClick({ type: "personalBlockMap", isChecked: abfPersonalBlockEnabled.checked });
};

const setPersonalList = async () => {
  let result = await getStorageValue("personalBlockMap", "sync");
  if (Object.keys(result).length === 0) {
    result = await getStorageValue("personalBlockMap");
  }

  const personalBlockMap = result.personalBlockMap;
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

const saveSearchDepth = async (_event: Event) => {
  const inputValue = abfSearchDepth.value;

  const newDepth = Number(inputValue);

  if (Number.isInteger(newDepth) && newDepth > -1) {
    await setStorageValue({ searchDepth: newDepth }, "sync");
    await setStorageValue({ searchDepth: newDepth });
    abfSearchDepthSavedConfirm.style.display = "block";
    // use the same isChecked value as the personalBlockEnabled checkbox
    sendMessageToContentScriptPostClick({ type: "personalBlockMap", isChecked: abfPersonalBlockEnabled.checked });
  }
};

const showKnownBrands = async (_event: Event) => {
  if (abfKnownBrandsListDiv.style.display === "none") {
    abfKnownBrandsListDiv.style.display = "block";
    knownBrandViewControlButton.value = await getMessage("hide_all");
    setStorageValue({ showKnownBrands: true }, "local");
    setStorageValue({ showKnownBrands: true }, "sync");
  } else {
    abfKnownBrandsListDiv.style.display = "none";
    knownBrandViewControlButton.value = await getMessage("show_all");
    setStorageValue({ showKnownBrands: false }, "local");
    setStorageValue({ showKnownBrands: false }, "sync");
  }
};

const showSeenBrands = async (_event: Event) => {
  if (abfSeenBrandsListDiv.style.display === "none") {
    abfSeenBrandsListDiv.style.display = "block";
    seenBrandViewControlButton.value = await getMessage("hide_all");
    setStorageValue({ showSeenBrands: true }, "local");
    setStorageValue({ showSeenBrands: true }, "sync");
  } else {
    abfSeenBrandsListDiv.style.display = "none";
    seenBrandViewControlButton.value = await getMessage("show_all");
    setStorageValue({ showSeenBrands: false }, "local");
    setStorageValue({ showSeenBrands: false }, "sync");
  }
};

// i think i want to create a unified function here to display the different lists with checkboxes but i want to know all the actions i want to perform before i do that
const createKnownBrandList = async () => {
  console.log("AmazonBrandFilter: %cCreateKnownBrandList", "color: yellow");
  let result = await getStorageValue("brandsMap");

  if (Object.keys(result.brandsMap).length === 0) {
    console.log("createKnownBrandList: no knownDepts found in sync storage");
    return;
  }
  if (!result.brandsMap) {
    console.log("createKnownBrandList: brandMap is empty");
    return;
  }
  console.debug(`createKnownBrandList: ${Object.keys(result.brandsMap).length} brands found in brandMap storage`);
  const textValue = Object.keys(result.brandsMap).sort();

  for (const key of textValue) {
    const brandDiv = document.createElement("div");
    brandDiv.innerText = key;
    // const deptEntryLabel = document.createElement("label");
    // deptEntryLabel.htmlFor = deptCheckbox.id;
    // deptEntryLabel.innerText = key;
    abfKnownBrandsListDiv.appendChild(brandDiv);
  }
};

const createSeenBrandList = async () => {
  console.log("AmazonBrandFilter: %cCreateSeenBrandList", "color: yellow");
  let result = await getStorageValue("seenBrands");

  if (Object.keys(result.seenBrands).length === 0) {
    console.log("createSeenBrandList: no seenBrands found in sync storage");
    return;
  }
  if (!result.seenBrands) {
    console.log("createSeenBrandList: seenBrands is empty");
    return;
  }
  console.debug(`createSeenBrandList: ${Object.keys(result.seenBrands).length} brands found in seenBrands storage`);
  const textValue = Object.keys(result.seenBrands).sort();

  for (const key of textValue) {
    const brandDiv = document.createElement("div");
    brandDiv.innerText = key;
    abfSeenBrandsListDiv.appendChild(brandDiv);
  }
};

const sendMessageToContentScriptPostClick = (message: PopupMessage) => {
  getEngineApi().tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    if (!activeTab || !activeTab.id || !activeTab.url?.includes(".amazon.")) {
      return;
    }
    getEngineApi().tabs.sendMessage(activeTab.id, message);
  });
};

abfEnabled.addEventListener("click", enableDisable);
abfFilterRefiner.addEventListener("click", setFilterRefiner);
abfFilterRefinerHide.addEventListener("click", setRefinerHide);
abfFilterRefinerGrey.addEventListener("click", setRefinerGrey);
abfAllowRefineBypass.addEventListener("click", setRefinerBypass);
abfDebugMode.addEventListener("click", setDebugMode);
abfPersonalBlockEnabled.addEventListener("click", setPersonalBlockEnabled);
abfPersonalBlockButton.addEventListener("click", savePersonalBlock);

// these are only on the dashboard
if (guiLocation === "dashboard") {
  abfFilterWithRefiner.addEventListener("click", setFilterWithRefiner);
  knownBrandViewControlButton.addEventListener("click", showKnownBrands);
  seenBrandViewControlButton.addEventListener("click", showSeenBrands);
  createKnownBrandList();
  createSeenBrandList();
  abfSaveSearchDepthButton.addEventListener("click", saveSearchDepth);
}
// abfHideAll.addEventListener("click", hideAll)

(async () => {
  await ensureSettingsExist();
  setText(guiLocation);
  setAddonVersion();
  setCheckBoxStates(guiLocation);
  setTextBoxStates();
  setPersonalList();

  console.log("AmazonBrandFilter: %cgui script loaded!", "color: lightgreen");
})();
