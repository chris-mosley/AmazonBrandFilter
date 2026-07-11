import {
  ensureSettingsExist,
  getEngineApi,
  getSettings,
  getStorageValue,
  setStorageValue,
} from "utils/browser-helpers";
import { getItemDivs, unHideDivs, getRefinerBrands } from "utils/helpers";
import { PopupMessage, SeenBrand, StorageSettings } from "utils/types";

const debugRed = "#ffbbbb";
const debugGreen = "#bbffbb";
const debugYellow = "#ffffbb";

const descriptionSearch = async (settings: StorageSettings, div: HTMLDivElement) => {
  const { syncSettings } = await getSettings();
  var shortText = div.getElementsByClassName("a-color-base a-text-normal") as HTMLCollectionOf<HTMLDivElement>;
  if (shortText.length === 0) {
    return;
  }

  // check to see if each word is in the map. if we dont stop then we hide it.
  const searchDepth = syncSettings.searchDepth;
  const fullText = shortText[0]?.innerText.toUpperCase() ?? "";
  const wordList = fullText.replace(", ", " ").split(" ").slice(0, searchDepth);
  for (let w = 0; w < settings.maxWordCount + 3; w++) {
    for (let x = 0; x < wordList.length; x++) {
      const searchTerm = wordList.slice(x, w).join(" ");
      if (searchTerm.length === 0) {
        continue;
      }

      if (settings.brandsMap[searchTerm]) {
        if (syncSettings.usePersonalBlock) {
          // block if found in personal block list
          if (syncSettings.personalBlockMap && syncSettings.personalBlockMap[searchTerm]) {
            if (settings.useDebugMode) {
              unHideItem(div);
              setBackgroundColor(div, debugYellow);
              addDebugLabel(div, searchTerm);
            } else {
              if (settings.filterMode === "hide") {
                hideItem(div);
              } else {
                setBackgroundColor(div, debugRed);
              }
            }

            return;
          } else {
            // if personal block is not enabled then we want to show the item again
            if (settings.useDebugMode) {
              setBackgroundColor(div, debugGreen);
              addDebugLabel(div, searchTerm);
            } else {
              removeDebugLabel(div);
              if (settings.filterMode === "hide") {
                hideItem(div);
              } else {
                setBackgroundColor(div, debugGreen);
              }
            }
            return;
          }
        } else {
          // if personal block is not enabled then we want to show the item again
          unHideItem(div);
          // div.style.display = "block";
          if (settings.useDebugMode) {
            setBackgroundColor(div, debugGreen);
            addDebugLabel(div, searchTerm);
          } else if (settings.filterMode === "color") {
            removeDebugLabel(div);
            setBackgroundColor(div, debugGreen);
          } else {
            removeDebugLabel(div);
            removeBackgoundColor(div);
          }
          return;
        }

        if (settings.useDebugMode) {
          addDebugLabel(div, searchTerm);
        } else {
          removeDebugLabel(div);
          removeBackgoundColor(div);
        }
        return;
      }
    }
  }

  if (settings.useDebugMode) {
    unHideItem(div);
    setBackgroundColor(div, debugRed);
  } else if (settings.filterMode === "color") {
    unHideItem(div);
    setBackgroundColor(div, debugRed);
  } else {
    hideItem(div);
    removeBackgoundColor(div);
  }
};

export const hideItem = (div: HTMLDivElement) => {
  div.closest<HTMLDivElement>("[data-component-type='s-search-result']")?.style.setProperty("display", "none");
};

export const unHideItem = (div: HTMLDivElement) => {
  div.closest<HTMLDivElement>("[data-component-type='s-search-result']")?.style.setProperty("display", "block");
};

const setBackgroundColor = (div: HTMLDivElement, color: string) => {
  div.style.backgroundColor = color;
};

const removeBackgoundColor = (div: HTMLDivElement) => {
  div.style.backgroundColor = "white";
};

const addDebugLabel = (div: HTMLDivElement, searchTerm: string) => {
  if (div.getElementsByClassName("ABF-DebugLabel " + searchTerm).length === 0) {
    var abflabel = document.createElement("span");
    abflabel.innerText = "ABF: " + searchTerm;
    abflabel.className = "ABF-DebugLabel " + searchTerm;
    abflabel.style.backgroundColor = "darkgreen";
    abflabel.style.color = "white";
    div.insertAdjacentElement("afterbegin", abflabel);
  }
};

const removeDebugLabel = (div: HTMLDivElement) => {
  div.getElementsByClassName("ABF-DebugLabel")[0]?.remove();
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

  const divs = refiner.getElementsByClassName("a-list-item") as HTMLCollectionOf<HTMLDivElement>;
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
        div.setAttribute("style", "display: none;");
      }

      if (settings.useDebugMode) {
        div.style.display = "inline-block";
        setBackgroundColor(div, debugRed);
      } else {
        setBackgroundColor(div, "white");
      }
    }
  }
};

const updateSeenBrands = async () => {
  const refinerBrands = getRefinerBrands();
  if (refinerBrands.length === 0) {
    return;
  }
  const seenBrands = await (await getStorageValue("seenBrands", "sync")).seenBrands;
  var updateSeenBrandsList = false;
  for (const brand of refinerBrands) {
    if (brand === "") {
      continue;
    }
    if (seenBrands[brand] === undefined) {
      // eventually I want to be able to add individual filters and the ability to create new brands tickets with these
      const newBrand: SeenBrand = {
        hide: false,
      };
      console.log("AmazonBrandFilter: Adding brand to seenBrands - " + brand);
      seenBrands[brand] = newBrand;
      updateSeenBrandsList = true;
    }
  }
  if (updateSeenBrandsList) {
    const seenBrandCount = Object.keys(seenBrands).length;
    console.debug(`AmazonBrandFilter: Updated seenBrands count: ${seenBrandCount}`);
    await setStorageValue({ seenBrands: seenBrands }, "local");
    await setStorageValue({ seenBrands: seenBrands }, "sync");
    await setStorageValue({ seenBrandCount: seenBrandCount }, "local");
    await setStorageValue({ seenBrandCount: seenBrandCount }, "sync");
  }
};

const filterBrands = async (settings: StorageSettings) => {
  if (!settings.enabled) {
    return;
  }

  const { syncSettings } = await getSettings();

  var brands = settings.brandsMap;
  if (syncSettings.filterWithRefiner) {
    if (settings.useDebugMode) {
      console.debug("AmazonBrandFilter: Using refiner to get brands");
    }
    const refinerBrands = document.getElementById("brandsRefinements")?.getElementsByClassName("a-spacing-micro");
    if (refinerBrands) {
      var refinerKnownBrands: Record<string, boolean> = {};
      for (const div of refinerBrands) {
        const brand =
          (
            div.getElementsByClassName("a-size-base a-color-base") as HTMLCollectionOf<HTMLDivElement>
          )[0]?.innerText.toUpperCase() ?? "";
        if (brand && brands[brand]) {
          refinerKnownBrands[brand] = true;
        }
      }
      if (refinerKnownBrands != null) {
        brands = refinerKnownBrands;
        if (settings.useDebugMode) {
          console.debug("AmazonBrandFilter: Found brands in refiner: " + Object.keys(refinerKnownBrands).join(","));
        }
      }
    }
  }

  if (Object.keys(brands).length === 0) {
    console.debug("AmazonBrandFilter: No brands found");
    return;
  }
  if (settings.useDebugMode) {
    console.debug("AmazonBrandFilter: Brands found");
  }

  if (settings.refinerBypass) {
    const refiner = document.getElementById("brandsRefinements")?.getElementsByTagName("input");
    if (refiner) {
      for (const input of refiner) {
        if (input.checked) {
          return;
        }
      }
    }
  }
  // if any of the departments are set not to filter we just cancel for now.
  const currentDepts = await (await getStorageValue("currentDepts")).currentDepts;
  for (const dept in currentDepts) {
    if (syncSettings.knownDepts[dept] != null && syncSettings.knownDepts[dept] != true) {
      console.log("AmazonBrandFilter: knownDepts[dept] is: " + syncSettings.knownDepts[dept]);
      resetBrands();
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
              hideItem(div);
            }
            continue;
          } else {
            unHideItem(div);
            if (settings.useDebugMode) {
              div.style.backgroundColor = debugGreen;
            } else {
              div.style.backgroundColor = "white";
            }
            continue;
          }
        } else {
          unHideItem(div);
          if (settings.useDebugMode) {
            div.style.backgroundColor = debugGreen;
          } else {
            setBackgroundColor(div, "white");
          }
          continue;
        }
      } else {
        if (settings.useDebugMode) {
          div.style.display = "block";
          unHideItem(div);
          setBackgroundColor(div, debugRed);
        } else {
          hideItem(div);
          setBackgroundColor(div, "white");
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
    div.getElementsByClassName("a-size-base a-color-base")[0]?.setAttribute("style", "");
    div.style.display = "block";
  });
};

const resetBrandsSearchResults = () => {
  const divs = [...getItemDivs()] as HTMLDivElement[];
  divs.forEach((div) => {
    removeDebugLabel(div);
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
          resetBrands();
          // previously hidden elements should be shown
          unHideDivs();
        } else {
          filterBrands(settings);
        }
        break;
      case "useDebugMode":
        filterBrands(settings);
        break;
      case "filterMode":
        filterBrands(settings);
        break;
      case "filterRefiner":
        resetBrandsRefiner();
        runFilterRefiner(settings);
        break;
      case "refinerMode":
        runFilterRefiner(settings);
        break;
      case "filterWithRefiner":
        runFilterRefiner(settings);
        break;
      case "usePersonalBlock":
      case "personalBlockMap":
        filterBrands(settings);
        break;
      case "deptFilter":
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
  const settings = await getStorageValue();
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
    if (settings.useDebugMode) {
      console.debug("AmazonBrandFilter: Mutation detected!");
    }
    runFilter();
  });
  observer.observe(document, {
    subtree: true,
    childList: true,
  });
};

(async () => {
  updateSeenBrands();
  unHideDivs();
  await ensureSettingsExist();
  runFilter();
  listenForMessages();
  startObserver();

  console.log("AmazonBrandFilter: %cContent script loaded!", "color: lightgreen");
})();
