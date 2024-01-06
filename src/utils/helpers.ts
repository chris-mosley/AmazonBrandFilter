import _ from "lodash";
import { browser } from "webextension-polyfill-ts";

import { Engine, StorageApiProps, StorageSettings, SyncStorageSettings } from "utils/types";

/**
 * retrieves the name of the browser engine based on the runtime environment.
 *
 * @returns
 */
export const getEngine = (): Engine => {
  if (typeof chrome !== "undefined") {
    return "chromium";
  } else if (typeof browser !== "undefined") {
    return "gecko";
  } else {
    throw new Error("Unsupported engine.");
  }
};

/**
 * retrieves the API object for the current browser environment.
 *
 * @returns
 */
export const getEngineApi = () => {
  const engine = getEngine();
  if (engine === "chromium") {
    return chrome;
  } else if (engine === "gecko") {
    return browser;
  } else {
    throw new Error("Unsupported engine.");
  }
};

// use function overloading to allow for multiple return types with different params
export async function getStorageValue(prop?: StorageApiProps): Promise<StorageSettings>;
export async function getStorageValue<T extends keyof StorageSettings>(
  keys: T | T[],
  prop?: Exclude<StorageApiProps, "sync">
): Promise<Record<T, StorageSettings[T]>>;
export async function getStorageValue<T extends keyof SyncStorageSettings>(
  keys: T | T[],
  prop: "sync"
): Promise<Record<T, SyncStorageSettings[T]>>;
/**
 * Retrieves a value from storage based on the current browser environment.
 * watch out for QUOTA_BYTES_PER_ITEM error when using "sync" prop (chrome)
 *
 * @param keys - The key/keys to look up in storage. Use null if undefined, which will return all keys.
 * @returns
 */
export async function getStorageValue<T extends keyof StorageSettings>(
  keys?: T | T[],
  prop: StorageApiProps = "local"
): Promise<Record<T, StorageSettings[T]>> {
  const engine = getEngine();
  if (engine === "chromium" && chrome.storage && chrome.storage[prop]) {
    return await new Promise((resolve) => {
      chrome.storage[prop].get(keys ?? null, (result) => {
        resolve(result as Record<T, StorageSettings[T]>);
      });
    });
  } else if (engine === "gecko" && browser.storage && browser.storage[prop]) {
    const result = await browser.storage[prop].get(keys ?? null);
    return result as Record<T, StorageSettings[T]>;
  } else {
    throw new Error("Storage API not found.");
  }
}

export async function setStorageValue(
  data: Partial<StorageSettings>,
  prop?: Exclude<StorageApiProps, "sync">
): Promise<void>;
export async function setStorageValue(data: Partial<SyncStorageSettings>, prop: "sync"): Promise<void>;
/**
 * set value in storage
 *
 * @param data
 * @returns
 */
export async function setStorageValue(data: Partial<StorageSettings>, prop: StorageApiProps = "local"): Promise<void> {
  const engine = getEngine();
  if (engine === "chromium" && chrome.storage && chrome.storage[prop]) {
    return new Promise((resolve) => {
      chrome.storage[prop].set(data, () => {
        resolve();
      });
    });
  } else if (engine === "gecko" && browser.storage && browser.storage[prop]) {
    return browser.storage[prop].set(data);
  } else {
    throw new Error("Storage API not found.");
  }
}

export const getMessage = async (message: string): Promise<string> => {
  const engine = getEngine();
  if (engine == "gecko" && browser.i18n) {
    return browser.i18n.getMessage(message);
  } else if (engine == "chromium" && chrome.i18n) {
    return chrome.i18n.getMessage(message);
  } else {
    throw new Error("Unsupported engine.");
  }
};

export const setIcon = async () => {
  const result = await getStorageValue("enabled");
  if (result.enabled) {
    getEngineApi().action.setIcon({
      path: {
        48: "icons/abf-enabled-128.png",
      },
    });
  } else {
    getEngineApi().action.setIcon({
      path: {
        48: "icons/abf-disabled-128.png",
      },
    });
  }
};

/**
 * Retrieves the manifest data for the current extension based on the runtime engine.
 *
 * @returns
 */
export const getManifest = () => {
  const engine = getEngine();
  if (engine === "chromium") {
    return chrome.runtime.getManifest();
  } else if (engine === "gecko") {
    return browser.runtime.getManifest();
  } else {
    throw new Error("Unsupported engine.");
  }
};

/**
 * Retrieves information about the currently active tab based on the runtime engine.
 *
 * @returns
 */
export const getCurrentTab = () => {
  const engine = getEngine();
  if (engine === "chromium") {
    return new Promise((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        resolve(tabs[0]);
      });
    });
  } else if (engine === "gecko") {
    return browser.tabs.query({ active: true, currentWindow: true });
  } else {
    throw new Error("Unsupported engine.");
  }
};

export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const getItemDivs = (): HTMLCollectionOf<HTMLDivElement> => {
  const divs = document.getElementsByClassName("s-result-item");
  return divs as HTMLCollectionOf<HTMLDivElement>;
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

export const ensureSettingsExist = async (): Promise<boolean> => {
  const settings = await getStorageValue("sync");
  console.log(settings);

  // if there are no settings, wait for a period and try again
  if (Object.keys(settings).length === 0) {
    console.log("no settings found, waiting 3 seconds and trying again");
    await sleep(3000);
    return ensureSettingsExist();
  }
  return true;
};

/**
 * extracts a subset of settings suitable for sync storage
 *
 * @param settings
 * @returns
 */
export const extractSyncStorageSettingsObject = (settings: StorageSettings): SyncStorageSettings => {
  return _.omit(settings, ["brandsMap", "brandsCount", "brandsVersion"]);
};
