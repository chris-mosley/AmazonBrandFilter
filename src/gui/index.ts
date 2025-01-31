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
const abfFilterWithRefiner = document.getElementById("abf-use-filter-with-refiner")! as HTMLInputElement;

// numbers
const versionNumber = document.getElementById("version-number")! as HTMLSpanElement;
const brandCount = document.getElementById("brand-count")! as HTMLSpanElement;
const deptCount = document.getElementById("dept-count")! as HTMLSpanElement;
const lastRun = document.getElementById("last-run")! as HTMLSpanElement;

const abfFullDeptListDiv = document.getElementById("abf-dashboard-depts")! as HTMLTextAreaElement;
const deptViewControlButton = document.getElementById("abf-dept-view-control")! as HTMLButtonElement;
// labels
const abfEnabledText = document.getElementById("abf-enabled-text")! as HTMLInputElement;
const abfFilterRefinerText = document.getElementById("abf-filter-refiner-text")! as HTMLInputElement;
const abfFilterRefinerHideText = document.getElementById("abf-filter-refiner-hide-text")! as HTMLInputElement;
const abfFilterRefinerGreyText = document.getElementById("abf-filter-refiner-grey-text")! as HTMLInputElement;
const abfAllowRefineBypassText = document.getElementById("abf-allow-refine-bypass-text")! as HTMLInputElement;
const abfDebugModeText = document.getElementById("abf-debug-mode-text")! as HTMLInputElement;
const abfPersonalBlockEnabledText = document.getElementById("abf-personal-block-enabled-text")! as HTMLInputElement;
const abfCurrentDeptsDiv = document.getElementById("abf-current-depts")! as HTMLInputElement;
const abfDepartmentHeaderText = document.getElementById("department-header-text")! as HTMLInputElement;
const abfDepartmentsText = document.getElementById("department-list-text")! as HTMLInputElement;
const abfPersonalBlockText = document.getElementById("abf-personal-block-saved-confirm")! as HTMLSpanElement;
const brandListVersionText = document.getElementById("brand-version-text")! as HTMLSpanElement;
const brandCountText = document.getElementById("brand-count-text")! as HTMLSpanElement;
const feedbackText = document.getElementById("popup-feedback-text")! as HTMLSpanElement;
const missingBrandText = document.getElementById("popup-missing-brand-text")! as HTMLSpanElement;
const lastRunText = document.getElementById("last-run")! as HTMLSpanElement;
const helptranslate = document.getElementById("popup-help-translate")! as HTMLSpanElement;
const dashboard = document.getElementById("popup-dashboard")! as HTMLSpanElement;
const abfCurrentDepartments = document.getElementById("abf-current-depts-header")! as HTMLSpanElement;
const abfFilterWithRefinerText = document.getElementById("abf-use-filter-with-refiner-text")! as HTMLInputElement;
const abfExperimentalFeatures = document.getElementById("abf-experimental-features")! as HTMLSpanElement;

const setText = async (locationPath: GuiLocation) => {
  const { settings, syncSettings } = await getSettings();
  // these have to be snake_case because chrome doesnt support hyphens in i18n
  abfEnabledText.innerText = await getMessage("popup_enabled");
  abfFilterRefinerText.innerText = await getMessage("popup_filter_sidebar");
  abfFilterRefinerHideText.innerText = await getMessage("popup_sidebar_hide");
  abfFilterRefinerGreyText.innerText = await getMessage("popup_sidebar_grey");
  abfAllowRefineBypassText.innerText = await getMessage("popup_allow_refine_bypass");

  abfDebugModeText.innerText = await getMessage("popup_debug");
  abfPersonalBlockEnabledText.innerText = await getMessage("popup_personal_blocklist");
  abfPersonalBlockButton.value = await getMessage("save_button");
  abfPersonalBlockText.innerText = await getMessage("save_confirm");

  brandListVersionText.innerText = await getMessage("brand_list_version");
  brandCountText.innerText = await getMessage("brand_list_count");
  feedbackText.innerText = await getMessage("popup_feedback_link");
  missingBrandText.innerText = await getMessage("popup_missing_brand");
  lastRunText.innerText = await getMessage("popup_last_run");
  helptranslate.innerText = await getMessage("popup_help_translate");
  abfDepartmentsText.innerText = await getMessage("department_header");
  if (locationPath === "dashboard") {
    abfFilterWithRefinerText.innerText = await getMessage("use_filter_with_refiner");
    abfFilterWithRefinerText.title = await getMessage("use_filter_with_refiner_tooltip");
    abfExperimentalFeatures.innerText = await getMessage("experimental_features");
    abfExperimentalFeatures.title = await getMessage("experimental_features_tooltip");
    if (syncSettings.showAllDepts === null) {
      if (settings.showAllDepts) {
        deptViewControlButton.value = await getMessage("hide_all");
        abfFullDeptListDiv.style.display = "block";
      } else {
        deptViewControlButton.value = await getMessage("show_all");
        abfFullDeptListDiv.style.display = "none";
        abfDepartmentHeaderText.innerText = await getMessage("department_header");
      }
    }
    if (syncSettings.showAllDepts) {
      deptViewControlButton.value = await getMessage("hide_all");
      abfFullDeptListDiv.style.display = "block";
    } else {
      deptViewControlButton.value = await getMessage("show_all");
      abfFullDeptListDiv.style.display = "none";
    }
  } else {
    dashboard.innerText = await getMessage("popup_dashboard");
    abfCurrentDepartments.innerText = await getMessage("current_departments");
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
  deptCount.innerText = settings.deptCount?.toString() ?? "";

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

const saveDepartmentFilter = async (dept: string, enabled: boolean) => {
  const knownDepts = await getStorageValue("knownDepts", "sync");
  knownDepts.knownDepts[dept] = enabled;
  setStorageValue(knownDepts, "local");
  setStorageValue(knownDepts, "sync");
};

const processDepartmentFilter = async (dept: string, enabled: boolean) => {
  await saveDepartmentFilter(dept, enabled);
  sendMessageToContentScriptPostClick({ type: "deptFilter", isChecked: enabled });
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

const showDepartmentList = async (_event: Event) => {
  if (abfFullDeptListDiv.style.display === "none") {
    abfFullDeptListDiv.style.display = "block";
    deptViewControlButton.value = await getMessage("hide_all");
    setStorageValue({ showAllDepts: true }, "local");
    setStorageValue({ showAllDepts: true }, "sync");
  } else {
    abfFullDeptListDiv.style.display = "none";
    deptViewControlButton.value = await getMessage("show_all");
    setStorageValue({ showAllDepts: false }, "local");
    setStorageValue({ showAllDepts: false }, "sync");
  }
};

const createDepartmentList = async (guiLocation: GuiLocation) => {
  console.log("AmazonBrandFilter: %cshowDepartmentList", "color: yellow");
  let result = await getStorageValue("knownDepts", "sync");

  if (Object.keys(result.knownDepts).length === 0) {
    console.log("showDepartmentList: no knownDepts found in sync storage");
    return;
  }
  if (!result.knownDepts) {
    console.log("showDepartmentList: knownDeptsMap is empty");
    return;
  }
  console.debug(`showDepartmentList: ${Object.keys(result.knownDepts).length} departments found in sync storage`);
  var textValue = null;
  if (guiLocation === "dashboard") {
    textValue = Object.keys(result.knownDepts).sort();
  } else {
    var currentDepts = await (await getStorageValue("currentDepts", "local")).currentDepts;
    textValue = Object.keys(currentDepts).sort();
    if (textValue === undefined) {
      textValue = await getMessage("dept_unknown");
    }
  }

  for (const key of textValue) {
    const deptDiv = document.createElement("div");
    const deptCheckbox = document.createElement("input");
    deptCheckbox.type = "checkbox";
    deptCheckbox.id = `abf-dept-checkbox-${key.replace(" ", "-")}`;
    if (result.knownDepts[key]) {
      deptCheckbox.checked = true;
    } else {
      deptCheckbox.checked = false;
    }
    deptCheckbox.addEventListener("click", () => {
      processDepartmentFilter(key, deptCheckbox.checked);
    });
    const deptEntryLabel = document.createElement("label");
    deptEntryLabel.htmlFor = deptCheckbox.id;
    deptEntryLabel.innerText = key;

    deptDiv.appendChild(deptCheckbox);
    deptDiv.appendChild(deptEntryLabel);
    if (guiLocation === "popup") {
      abfCurrentDeptsDiv.appendChild(deptDiv);
    } else {
      abfFullDeptListDiv.appendChild(deptDiv);
    }
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
  deptViewControlButton.addEventListener("click", showDepartmentList);
  abfFilterWithRefiner.addEventListener("click", setFilterWithRefiner);
}
// abfHideAll.addEventListener("click", hideAll)

(async () => {
  await ensureSettingsExist();
  setText(guiLocation);
  setAddonVersion();
  createDepartmentList(guiLocation);
  setCheckBoxStates(guiLocation);
  setTextBoxStates();
  setPersonalList();
  console.log("AmazonBrandFilter: %cgui script loaded!", "color: lightgreen");
})();
