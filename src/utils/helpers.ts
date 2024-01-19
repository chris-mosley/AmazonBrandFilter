import difference from "lodash/difference";
import keys from "lodash/keys";
import omit from "lodash/omit";

import { defaultLocalStorageValue, defaultSyncStorageValue } from "utils/config";
import { StorageSettings, SyncStorageSettings } from "utils/types";

export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const getItemDivs = (): HTMLCollectionOf<HTMLDivElement> => {
  const divs = document.querySelectorAll(`[data-component-type="s-search-result"].s-result-item`);
  return Array.from(divs) as unknown as HTMLCollectionOf<HTMLDivElement>;
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
  const keysDefaultSettings = keys(defaultLocalStorageValue);
  const keysSyncSettings = keys(defaultSyncStorageValue);
  const exclusiveKeys = difference(keysDefaultSettings, keysSyncSettings);
  return omit(settings, exclusiveKeys) as SyncStorageSettings;
};
