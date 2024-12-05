import { browser } from "webextension-polyfill-ts";

import { extractSyncStorageSettingsObject, sleep } from "utils/helpers";
import {
  Engine,
  StorageMode,
  StorageArea,
  StorageSettings,
  SyncStorageSettings,
  PopupMessage,
  BackgroundMessage,
  ContentMessage,
} from "utils/types";

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
 * watch out for QUOTA_BYTES_PER_ITEM error when using "sync" param (chrome)
 *
 * @param keys - The key/keys to look up in storage. Use null if undefined, which will return all keys.
 * @param storageArea - The storage area to use. Defaults to "local".
 * @returns
 */
export async function getStorageValue(storageArea?: Exclude<StorageArea, "sync">): Promise<StorageSettings>;
export async function getStorageValue(storageArea: "sync"): Promise<SyncStorageSettings>;
export async function getStorageValue<T extends keyof StorageSettings>(
  keys: T | T[],
  storageArea?: Exclude<StorageArea, "sync">
): Promise<Record<T, StorageSettings[T]>>;
export async function getStorageValue<T extends keyof SyncStorageSettings>(
  keys: T | T[],
  storageArea: "sync"
): Promise<Record<T, SyncStorageSettings[T]>>;
export async function getStorageValue<T extends keyof StorageSettings>(
  keys?: T | T[],
  storageArea: StorageArea = "local"
): Promise<Record<T, StorageSettings[T]>> {
  const engine = getEngine();
  if (engine === "chromium" && chrome.storage && chrome.storage[storageArea]) {
    return await new Promise((resolve) => {
      chrome.storage[storageArea].get(keys ?? null, (result) => {
        resolve(result as Record<T, StorageSettings[T]>);
      });
    });
  } else if (engine === "gecko" && browser.storage && browser.storage[storageArea]) {
    const result = await browser.storage[storageArea].get(keys ?? null);
    return result as Record<T, StorageSettings[T]>;
  } else {
    throw new Error("Storage API not found.");
  }
}

/**
 * set value in storage
 *
 * @param data - The data to store.
 * @param storageArea - The storage area to use. Defaults to "local".
 * @param mode - Determines whether to overwrite the existing data or merge it with the new data. Defaults to "normal".
 * @returns
 */
export async function setStorageValue(
  data: Partial<StorageSettings>,
  storageArea?: Exclude<StorageArea, "sync">
): Promise<void>;
export async function setStorageValue(data: Partial<SyncStorageSettings>, storageArea: "sync"): Promise<void>;
export async function setStorageValue(
  data: Partial<StorageSettings>,
  storageArea?: Exclude<StorageArea, "sync">,
  mode?: StorageMode
): Promise<void>;
export async function setStorageValue(
  data: Partial<SyncStorageSettings>,
  storageArea: "sync",
  mode?: StorageMode
): Promise<void>;
export async function setStorageValue(
  data: Partial<StorageSettings>,
  storageArea: StorageArea = "local",
  mode: StorageMode = "normal"
): Promise<void> {
  const engine = getEngine();
  if (engine === "chromium" && chrome.storage && chrome.storage[storageArea]) {
    if (mode === "overwrite") {
      await new Promise<void>((resolve) => {
        chrome.storage[storageArea].clear(() => {
          resolve();
        });
      });
    }
    return new Promise((resolve) => {
      chrome.storage[storageArea].set(data, () => {
        resolve();
      });
    });
  } else if (engine === "gecko" && browser.storage && browser.storage[storageArea]) {
    if (mode === "overwrite") {
      await browser.storage[storageArea].clear();
    }
    return browser.storage[storageArea].set(data);
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

/**
 * used to send messages to the background script
 *
 * @param message
 */
export const sendRuntimeMessage = async (message: PopupMessage | BackgroundMessage | ContentMessage) => {
  const engine = getEngine();
  if (engine === "chromium") {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(message, (response) => {
        resolve(response);
      });
    });
  } else if (engine === "gecko") {
    return browser.runtime.sendMessage(message);
  } else {
    throw new Error("Unsupported engine.");
  }
};

/**
 * send message to parent window (from iframe)
 *
 * @param message
 */
export const sendMessageToParent = async (message: PopupMessage | BackgroundMessage) => {
  window.parent.postMessage(message, "*");
};
