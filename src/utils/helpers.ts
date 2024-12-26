import _ from "lodash";

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
  const divs = document.getElementById("departments");
  var depts: string[] = [];
  if (divs === null) {
    console.log("AmazonBrandFilter: Departments not found");
    depts.push("Unknown");
    return depts;
  }
  console.log(`AmazonBrandFilter: Departments found count: ${divs.children.length}`);
  for (const div of divs.children as HTMLCollectionOf<HTMLDivElement>) {
    // if (div.className == "a-size-base a-color-base") {
    console.log(`AmazonBrandFilter: Department found: ${div.innerText}`);
    depts.push(div.innerText);
    // }
  }
  console.log(`AmazonBrandFilter: Departments found: ${depts}`);
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
