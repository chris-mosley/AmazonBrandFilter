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
 * Retrieves a value from local storage based on the current browser environment.
 *
 * @param {string} key - The key to look up in local storage.
 * @returns
 */
export const getStorageValue = async (
  key?: string | string[]
): Promise<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [s: string]: any;
}> => {
  if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
    // chromium or similar
    return await new Promise((resolve) => {
      chrome.storage.local.get(key ?? null, (result) => {
        resolve(result);
      });
    });
  } else if (typeof browser !== "undefined" && browser.storage && browser.storage.local) {
    // firefox or similar
    return await browser.storage.local.get(key);
  } else {
    // unsupported environment
    throw new Error("Storage API not found.");
  }
};
