import { browser } from "webextension-polyfill-ts";

import { extractSyncStorageSettingsObject, sleep } from "utils/helpers";
import { Engine, StorageApiMode, StorageApiProps, StorageSettings, SyncStorageSettings } from "utils/types";

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

/**
 * Retrieves a value from storage based on the current browser environment.
 * watch out for QUOTA_BYTES_PER_ITEM error when using "sync" prop (chrome)
 *
 * @param keys - The key/keys to look up in storage. Use null if undefined, which will return all keys.
 * @param prop - The storage area to use. Defaults to "local".
 * @returns
 */
export async function getStorageValue(prop?: Exclude<StorageApiProps, "sync">): Promise<StorageSettings>;
export async function getStorageValue(prop: "sync"): Promise<SyncStorageSettings>;
export async function getStorageValue<T extends keyof StorageSettings>(
  keys: T | T[],
  prop?: Exclude<StorageApiProps, "sync">
): Promise<Record<T, StorageSettings[T]>>;
export async function getStorageValue<T extends keyof SyncStorageSettings>(
  keys: T | T[],
  prop: "sync"
): Promise<Record<T, SyncStorageSettings[T]>>;
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

/**
 * set value in storage
 *
 * @param data - The data to store.
 * @param prop - The storage area to use. Defaults to "local".
 * @param mode - Determines whether to overwrite the existing data or merge it with the new data. Defaults to "normal".
 * @returns
 */
export async function setStorageValue(
  data: Partial<StorageSettings>,
  prop?: Exclude<StorageApiProps, "sync">
): Promise<void>;
export async function setStorageValue(data: Partial<SyncStorageSettings>, prop: "sync"): Promise<void>;
export async function setStorageValue(
  data: Partial<StorageSettings>,
  prop?: Exclude<StorageApiProps, "sync">,
  mode?: StorageApiMode
): Promise<void>;
export async function setStorageValue(
  data: Partial<SyncStorageSettings>,
  prop: "sync",
  mode?: StorageApiMode
): Promise<void>;
export async function setStorageValue(
  data: Partial<StorageSettings>,
  prop: StorageApiProps = "local",
  mode: StorageApiMode = "normal"
): Promise<void> {
  const engine = getEngine();
  if (engine === "chromium" && chrome.storage && chrome.storage[prop]) {
    if (mode === "overwrite") {
      await new Promise<void>((resolve) => {
        chrome.storage[prop].clear(() => {
          resolve();
        });
      });
    }
    return new Promise((resolve) => {
      chrome.storage[prop].set(data, () => {
        resolve();
      });
    });
  } else if (engine === "gecko" && browser.storage && browser.storage[prop]) {
    if (mode === "overwrite") {
      await browser.storage[prop].clear();
    }
    return browser.storage[prop].set(data);
  } else {
    throw new Error("Storage API not found.");
  }
}

/**
 * attempt to get the sync settings first, then fall back to local
 * sync settings may not exist in some cases, so we just return the local settings instead
 *
 * @returns
 */
export const getSettings = async () => {
  let syncSettings = await getStorageValue("sync");
  const settings = await getStorageValue();
  if (Object.keys(syncSettings).length === 0) {
    syncSettings = { ...extractSyncStorageSettingsObject(settings) };
  }
  return { settings, syncSettings };
};

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

/**
 * waits for settings to be set in storage from the background script
 * required as the background script may not be ready before the popup/content scripts are loaded
 * always check local storage, never sync storage as sync storage is not always available
 *
 * @returns
 */
export const ensureSettingsExist = async (): Promise<boolean> => {
  const settings = await getStorageValue();

  // if there are no settings, wait for a period and try again
  if (Object.keys(settings).length === 0) {
    console.log("no settings found, waiting briefly and trying again");
    await sleep(1500);
    return ensureSettingsExist();
  }
  console.log("AmazonBrandFilter: %cSettings exist!", "color: lightgreen");
  return true;
};
