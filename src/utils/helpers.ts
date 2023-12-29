import { browser } from "webextension-polyfill-ts";

import { Engine, StorageApiProps, StorageSettings } from "utils/types";

/**
 * Retrieves the name of the browser engine based on the runtime environment.
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

// use function overloading to allow for multiple return types with different params
export async function getStorageValue(prop?: StorageApiProps): Promise<StorageSettings>;
export async function getStorageValue<T extends keyof StorageSettings>(
  keys: T | T[],
  prop?: StorageApiProps
): Promise<Record<T, StorageSettings[T]>>;
/**
 * Retrieves a value from storage based on the current browser environment.
 * watch out for QUOTA_BYTES_PER_ITEM error when using "sync" prop
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

/**
 * set value in storage
 *
 * @param data
 * @returns
 */
export const setStorageValue = async (
  data: Partial<StorageSettings>,
  prop: StorageApiProps = "local"
): Promise<void> => {
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
};

export const getMessage = async (message: string): Promise<string> => {
  const engine= getEngine();
  if(engine == "gecko" && browser.i18n) {
    return browser.i18n.getMessage(message);
  } else if(engine == "chromium" && chrome.i18n) {
    return chrome.i18n.getMessage(message);
  } else {
    throw new Error("Unsupported engine.")
  }
}

export const setIcon = async () => {
  const engine = getEngine();
  const result = await getStorageValue("enabled");
  if (result.enabled) {
    (engine === "gecko" ? chrome : browser).action.setIcon({
      path: {
        48: "icons/abf-enabled-128.png",
      },
    });
  } else {
    (engine === "gecko" ? chrome : browser).action.setIcon({
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
  for (let i = 0; i < divs.length; i++) {
    divs[i].style.display = "block";
  }
};
