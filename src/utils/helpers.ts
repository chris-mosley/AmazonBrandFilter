import _ from "lodash";

// import {
//   ensureSettingsExist,
//   getSettings,
//   getStorageValue,
//   setIcon,
//   setStorageValue,
// } from "utils/browser-helpers";
import { defaultLocalStorageValue, defaultSyncStorageValue } from "utils/config";
import { StorageSettings, SyncStorageSettings } from "utils/types";

export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const getItemDivs = (): HTMLCollectionOf<HTMLDivElement> => {
  const divs = document.getElementsByClassName("s-result-item");
  return divs as HTMLCollectionOf<HTMLDivElement>;
};

export const getDepartments = (): string[] => {
  var divs = document.getElementById("departments");

  var depts: string[] = [];
  if (divs !== null) {
    const deptElements = divs.getElementsByClassName("a-spacing-micro");

    // if we cant find the deparments, we hope we're in the mobile version and try to find from the filter tabs
    if (deptElements.length !== 0) {
      for (const div of deptElements as HTMLCollectionOf<HTMLDivElement>) {
        // so we just get the top level departments
        if (div.className.match(".*indent.*")) {
          continue;
        }
        depts.push(div.innerText);
      }
      return depts;
    }
  }
  const filterTabs = document.getElementsByClassName("a-section s-vtabs-contents-container");
  if (filterTabs.length > 0) {
    for (const tab of filterTabs as HTMLCollectionOf<HTMLDivElement>) {
      if (tab.children.namedItem("departments") === null) {
        continue;
      }
      const filterBarDeptElements = tab.children.namedItem("departments");
      if (filterBarDeptElements === null) {
        continue;
      }

      for (const div of filterBarDeptElements.getElementsByClassName(
        "a-size-small a-color-base puis-bold-weight-text"
      ) as HTMLCollectionOf<HTMLDivElement>) {
        depts.push(div.innerText);
      }
      return depts;
    }
  }
  //data-a-expander-name="sf-departments"
  const filterElements = document.querySelector('[data-a-expander-name="sf-departments"]');
  if (filterElements !== null) {
    const filterBarDeptElements = filterElements.getElementsByClassName(
      "a-section a-spacing-mini a-text-left sf-refinement-heading"
    );
    if (filterBarDeptElements.length > 0) {
      for (const div of filterBarDeptElements as HTMLCollectionOf<HTMLDivElement>) {
        for (const child of div.children as HTMLCollectionOf<HTMLDivElement>) {
          depts.push(child.innerText);
        }
      }
      return depts;
    }
  }

  console.log("AmazonBrandFilter: Departments not found");
  depts.push("Unknown");
  return depts;
};

export const unHideDivs = () => {
  const divs = getItemDivs();
  for (const div of divs) {
    div.style.display = "block";
  }
};

/**
 * use regular expression to split the input string based on the delimiters
 * delimiterPattern matches one or more commas, spaces, new lines, or return characters
 *
 * @returns
 */
export const getSanitizedUserInput = (userInput: string) => {
  const delimiterPattern = /[,\s\n\r]+/;
  const wordsArray = userInput.split(delimiterPattern);
  const upperCaseWordsArray = wordsArray.map((word) => word.toUpperCase());
  // remove empty strings from the array (e.g., if there are multiple consecutive delimiters)
  const filteredArray = upperCaseWordsArray.filter((word) => word.trim() !== "");
  return filteredArray;
};

/**
 * extracts a subset of settings suitable for sync storage
 *
 * @param settings
 * @returns
 */
export const extractSyncStorageSettingsObject = (settings: StorageSettings): SyncStorageSettings => {
  const keysDefaultSettings = _.keys(defaultLocalStorageValue);
  const keysSyncSettings = _.keys(defaultSyncStorageValue);
  const exclusiveKeys = _.difference(keysDefaultSettings, keysSyncSettings);
  return _.omit(settings, exclusiveKeys) as SyncStorageSettings;
};
