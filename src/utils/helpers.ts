import { browser } from "webextension-polyfill-ts";

import { Engine, StorageApiProps } from "utils/types";

/**
 * Retrieves the name of the browser engine based on the runtime environment.
 *
 * @returns {Engine}
 * @throws {Error}
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
 * Retrieves a value from storage based on the current browser environment.
 * watch out for QUOTA_BYTES_PER_ITEM error when using "sync" prop
 *
 * @param {string} keys - The key/keys to look up in storage.
 * @returns
 */
export const getStorageValue = async (
  keys?: string | string[],
  prop: StorageApiProps = "local"
): Promise<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [s: string]: any;
}> => {
  const engine = getEngine();
  if (engine === "chromium" && chrome.storage && chrome.storage[prop]) {
    return await new Promise((resolve) => {
      chrome.storage[prop].get(keys ?? null, (result) => {
        resolve(result);
      });
    });
  } else if (engine === "gecko" && browser.storage && browser.storage[prop]) {
    return await browser.storage[prop].get(keys);
  } else {
    throw new Error("Storage API not found.");
  }
};

/**
 * set value in storage
 *
 * @param data
 * @returns
 */
export const setStorageValue = async (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: { [key: string]: any },
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

export const setIcon = async () => {
  const engine = getEngine();
  const enabled = await getStorageValue("abf-enabled");
  if (enabled) {
    (engine === "chromium" ? chrome : browser).action.setIcon({
      path: {
        48: "icons/abf-enabled-128.png",
      },
    });
  } else {
    (engine === "chromium" ? chrome : browser).action.setIcon({
      path: {
        48: "icons/abf-disabled-128.png",
      },
    });
  }
};

/**
 * Retrieves the manifest data for the current extension based on the runtime engine.
 *
 * @returns {object}
 * @throws {Error}
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
 * @returns {Promise<chrome.tabs.Tab | browser.tabs.Tab>}
 * @throws {Error}
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
  console.log("AmazonBrandFilter: Starting getItemDivs");
  const divs = document.getElementsByClassName("s-result-item");
  return divs as HTMLCollectionOf<HTMLDivElement>;
};

export const unHideDivs = () => {
  console.log("AmazonBrandFilter: Starting unHideDivs");
  const divs = getItemDivs();
  for (let i = 0; i < divs.length; i++) {
    divs[i].style.display = "block";
  }
};
