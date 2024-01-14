import {
  ensureSettingsExist,
  getEngineApi,
  getSettings,
  getStorageValue,
  setStorageValue,
} from "utils/browser-helpers";
import { getItemDivs, unHideDivs } from "utils/helpers";
import { PopupMessage, StorageSettings } from "utils/types";

const checkBrandFilter = (): boolean => {
  const boxesdiv = document.getElementById("brandsRefinements")?.children;
  if (!boxesdiv) {
    return false;
  }

  let boxes: HTMLCollectionOf<HTMLInputElement> | undefined;
  for (const div of boxesdiv) {
    boxes = div.getElementsByTagName("input");
    if (boxes.length > 0) {
      break;
    }
  }

  if (!boxes) {
    return false;
  }

  for (const box of boxes) {
    if (box.checked) {
      return true;
    }
  }
  return false;
};

const descriptionSearch = async (settings: StorageSettings, div: HTMLDivElement) => {
  const { syncSettings } = await getSettings();

  const shortText = div.getElementsByClassName("a-color-base a-text-normal") as HTMLCollectionOf<HTMLDivElement>;
  if (shortText.length === 0) {
    return;
  }

  // check to see if each word is in the map. if we dont stop then we hide it.
  const fullText = shortText[0]?.innerText.toUpperCase() ?? "";
  const wordList = fullText.replace(", ", " ").split(" ").slice(0, 8);
  for (let w = 0; w < settings.maxWordCount + 3; w++) {
    for (let x = 0; x < wordList.length; x++) {
      const searchTerm = wordList.slice(x, w).join(" ");
      if (searchTerm.length === 0) {
        continue;
      }

      if (settings.brandsMap[searchTerm]) {
        if (syncSettings.usePersonalBlock) {
          if (syncSettings.personalBlockMap && syncSettings.personalBlockMap[searchTerm]) {
            if (settings.useDebugMode) {
              div.style.display = "block";
              div.style.backgroundColor = "yellow";
            } else {
              div.style.display = "none";
              div.style.backgroundColor = "white";
            }
            return;
          } else {
            // if personal block is not enabled then we want to show the item again
            div.style.display = "block";
            if (settings.useDebugMode) {
              div.style.backgroundColor = "green";
            } else {
              div.style.backgroundColor = "white";
            }
            return;
          }
        } else {
          // if personal block is not enabled then we want to show the item again
          div.style.display = "block";
          if (settings.useDebugMode) {
            div.style.backgroundColor = "green";
          } else {
            div.style.backgroundColor = "white";
          }
          return;
        }

        if (settings.useDebugMode) {
          div.style.display = "block";
          div.style.backgroundColor = "green";
        } else {
          div.style.backgroundColor = "white";
        }
        return;
      }
    }
  }

  if (settings.useDebugMode) {
    div.style.display = "block";
    div.style.backgroundColor = "red";
  } else {
    div.style.display = "none";
    div.style.backgroundColor = "white";
  }
};

const runFilterRefiner = async (settings: StorageSettings) => {
  if (!settings.enabled || !settings.filterRefiner) {
    return;
  }

  const { syncSettings } = await getSettings();

  const refiner = document.getElementById("brandsRefinements");
  if (!refiner) {
    return;
  }

  const divs = refiner.getElementsByClassName("a-spacing-micro") as HTMLCollectionOf<HTMLDivElement>;
  for (const div of divs) {
    const brand =
      (
        div.getElementsByClassName("a-size-base a-color-base") as HTMLCollectionOf<HTMLDivElement>
      )[0]?.innerText.toUpperCase() ?? "";
    if (brand.length === 0) {
      continue;
    }

    if (!settings.brandsMap[brand] || (syncSettings.usePersonalBlock && syncSettings.personalBlockMap[brand])) {
      if (settings.refinerMode === "grey") {
        div.style.display = "block";
        div
          .getElementsByClassName("a-size-base a-color-base")[0]
          ?.setAttribute("style", "display: inlne-block; color: grey !important;");
      } else {
        div.style.display = "none";
        div
          .getElementsByClassName("a-size-base a-color-base")[0]
          ?.setAttribute("style", "display: inline-block; color: black !important;");
      }

      if (settings.useDebugMode) {
        div.style.display = "inline-block";
        div.style.backgroundColor = "red";
      } else {
        div.style.backgroundColor = "white";
      }
    }
  }
};

const filterBrands = async (settings: StorageSettings) => {
  if (!settings.enabled) {
    return;
  }

  const { syncSettings } = await getSettings();

  const brands = settings.brandsMap;
  if (Object.keys(brands).length === 0) {
    console.log("AmazonBrandFilter: No brands found");
    return;
  }
  console.log("AmazonBrandFilter: Brands found");

  if (settings.refinerBypass) {
    if (checkBrandFilter()) {
      return;
    }
  }

  const divs = getItemDivs();
  for (const div of divs) {
    const itemHeader = div.getElementsByClassName("s-line-clamp-1") as HTMLCollectionOf<HTMLDivElement>;
    if (itemHeader.length !== 0) {
      const searchTerm = itemHeader[0]?.innerText.toUpperCase();
      if (searchTerm && settings.brandsMap[searchTerm]) {
        if (syncSettings.usePersonalBlock) {
          if (syncSettings.personalBlockMap && syncSettings.personalBlockMap[searchTerm]) {
            if (settings.useDebugMode) {
              div.style.display = "block";
              div.style.backgroundColor = "yellow";
            } else {
              div.style.display = "none";
            }
            continue;
          } else {
            div.style.display = "block";
            if (settings.useDebugMode) {
              div.style.backgroundColor = "green";
            } else {
              div.style.backgroundColor = "white";
            }
            continue;
          }
        } else {
          div.style.display = "block";
          if (settings.useDebugMode) {
            div.style.backgroundColor = "green";
          } else {
            div.style.backgroundColor = "white";
          }
          continue;
        }
      } else {
        if (settings.useDebugMode) {
          div.style.display = "block";
          div.style.backgroundColor = "red";
        } else {
          div.style.display = "none";
          div.style.backgroundColor = "white";
        }
        continue;
      }
    }

    const shortText = div.getElementsByClassName("a-color-base a-text-normal") as HTMLCollectionOf<HTMLDivElement>;
    if (shortText.length === 0) {
      continue;
    }
    await descriptionSearch(settings, div);
  }

  if (settings.filterRefiner) {
    runFilterRefiner(settings);
  }
};

const resetBrandsRefiner = () => {
  const divs = [
    ...(document.getElementById("brandsRefinements")?.getElementsByClassName("a-spacing-micro") ?? []),
  ] as HTMLDivElement[];
  divs.forEach((div) => {
    div.style.backgroundColor = "white";
    div
      .getElementsByClassName("a-size-base a-color-base")[0]
      ?.setAttribute("style", "display: block; color: black !important;");
    div.style.display = "block";
  });
};

const resetBrandsSearchResults = () => {
  const divs = [...getItemDivs()] as HTMLDivElement[];
  divs.forEach((div) => {
    div.style.backgroundColor = "white";
    div.style.display = "block";
  });
};

/**
 * resets the brands filter to the default Amazon settings (colors and display)
 */
const resetBrands = () => {
  resetBrandsRefiner();
  resetBrandsSearchResults();
};

const listenForMessages = () => {
  getEngineApi().runtime.onMessage.addListener(async (message: PopupMessage) => {
    console.log({ type: message.type, isChecked: message.isChecked });
    const settings = await getStorageValue();
    switch (message.type) {
      case "enabled":
        if (message.isChecked) {
          filterBrands(settings);
        } else {
          resetBrands();
          // previously hidden elements should be shown
          unHideDivs();
        }
        break;
      case "refinerBypass":
        if (message.isChecked) {
          if (checkBrandFilter()) {
            return;
          }
        }
        break;
      case "useDebugMode":
        filterBrands(settings);
        break;
      case "filterRefiner":
        resetBrandsRefiner();
        runFilterRefiner(settings);
        break;
      case "refinerMode":
        runFilterRefiner(settings);
        break;
      case "usePersonalBlock":
      case "personalBlockMap":
        filterBrands(settings);
        break;
      default:
        break;
    }
  });
};

const runFilter = async () => {
  const settings = await getStorageValue();
  if (!settings.enabled) {
    return;
  }

  const timerStart = performance.now();
  filterBrands(settings);
  const timerEnd = performance.now();
  setStorageValue({ lastMapRun: timerEnd - timerStart });
};

const startObserver = async () => {
  console.log("AmazonBrandFilter: Starting observer!");
  const observer = new MutationObserver(async (mutations) => {
    // check if the mutation is invalid
    let mutationInvalid = false;
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      mutationInvalid = Array.from(mutation.addedNodes).some(
        (node) =>
          // check if the node is a carousel card class (these are the revolving ads)
          (node as HTMLElement).classList?.contains("a-carousel-card") ||
          // check if the node contains the text "ends in" (lowercase)
          (node.nodeType === 3 && (node as Text).textContent?.toLowerCase().includes("ends in"))
      );
    }

    if (mutationInvalid) {
      return;
    }

    console.log("AmazonBrandFilter: Mutation detected!");
    runFilter();
  });
  observer.observe(document, {
    subtree: true,
    childList: true,
  });
};

(async () => {
  unHideDivs();
  await ensureSettingsExist();
  runFilter();
  listenForMessages();
  startObserver();
  console.log("AmazonBrandFilter: %cContent script loaded!", "color: lightgreen");
})();
