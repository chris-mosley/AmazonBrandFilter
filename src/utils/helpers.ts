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
  const divs = document.getElementsByClassName("s-card-container");
  return divs as HTMLCollectionOf<HTMLDivElement>;
};

export const getRefinerBrands = (): string[] => {
  // i hate this.
  const visibleRefinerDivs = document
    .getElementById("brandsRefinements")
    ?.getElementsByClassName("a-unordered-list a-nostyle a-vertical a-spacing-medium")[0];

  const hiddenRefinerDivs = document
    .getElementById("brandsRefinements")
    ?.getElementsByClassName("a-unordered-list a-nostyle a-vertical a-spacing-none")[0];
  if (visibleRefinerDivs === null && hiddenRefinerDivs === null) {
    return [];
  }

  const refinerBrands: string[] = [];
  if (visibleRefinerDivs?.children[0] !== undefined) {
    for (const div of visibleRefinerDivs?.children as HTMLCollectionOf<HTMLDivElement>) {
      console.debug("AmazonBrandFilter: getRefinerBrands - visible - found div: " + div.innerText);
      if (div.innerText === "Brand" || div.innerText === "Brands" || div.innerText === "See more") {
        continue;
      }
      refinerBrands.push(div.innerText.trimStart().trimEnd());
      console.debug("AmazonBrandFilter: getRefinerBrands pushing brand: " + div.innerText.trimStart().trimEnd());
    }
  }
  for (const div of hiddenRefinerDivs?.children as HTMLCollectionOf<HTMLDivElement>) {
    if (div.innerText === "Brand" || div.innerText === "Brands" || div.innerText === "See more") {
      continue;
    }
    refinerBrands.push(div.innerText.trimStart().trimEnd());
    console.debug("AmazonBrandFilter: getRefinerBrands pushing brand: " + div.innerText.trimStart().trimEnd());
  }
  return refinerBrands;
};

export const unHideDivs = () => {
  const divs = getItemDivs();
  for (const div of divs) {
    div.parentElement?.parentElement?.parentElement?.parentElement?.style.setProperty("display", "block", "important");
    console.log("AmazonBrandFilter: unHideDivs - un-hiding div: " + div.parentElement?.parentElement?.parentElement);
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
