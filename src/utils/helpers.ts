import { browser } from "webextension-polyfill-ts";

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

/**
 * Retrieves a value from storage based on the current browser environment.
 * using "local" instead of "sync" for larger storage quota (QUOTA_BYTES_PER_ITEM)
 *
 * @param {string} keys - The key/keys to look up in storage.
 * @returns
 */
export const getStorageValue = async (
  keys?: string | string[]
): Promise<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [s: string]: any;
}> => {
  if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
    // chromium or similar
    return await new Promise((resolve) => {
      chrome.storage.local.get(keys ?? null, (result) => {
        resolve(result);
      });
    });
  } else if (typeof browser !== "undefined" && browser.storage && browser.storage.local) {
    // firefox or similar
    return await getStorageValue(keys);
  } else {
    // unsupported environment
    throw new Error("Storage API not found.");
  }
};

export const setStorageValue = async (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: { [key: string]: any }
  // options?: chrome.storage.StorageObject | browser.storage.StorageObject
): Promise<void> => {
  if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
    // Chromium or similar
    return new Promise((resolve) => {
      chrome.storage.local.set(data, () => {
        resolve();
      });
    });
  } else if (typeof browser !== "undefined" && browser.storage && browser.storage.local) {
    // Firefox or similar
    return setStorageValue(data);
  } else {
    // Unsupported environment
    throw new Error("Storage API not found.");
  }
};
