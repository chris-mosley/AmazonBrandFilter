import _ from "lodash";
import {
  ensureSettingsExist,
  getEngineApi,
  getSettings,
  getStorageValue,
  setStorageValue,
} from "utils/browser-helpers";
import { getDepartments, getItemDivs, unHideDivs } from "utils/helpers";
import { PopupMessage, StorageSettings } from "utils/types";

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
          // block if found in personal block list
          if (syncSettings.personalBlockMap && syncSettings.personalBlockMap[searchTerm]) {
            if (settings.useDebugMode) {
              div.style.display = "block";
              div.style.backgroundColor = debugYellow;
              if (!shortText.item(0)!.textContent?.includes("ABF: " + searchTerm)) {
                shortText.item(0)!.textContent = "ABF: " + searchTerm + " - " + shortText.item(0)?.textContent;
              }
            } else {
              div.style.display = "none";
              div.style.backgroundColor = "white";
            }
            return;
          } else {
            // if personal block is not enabled then we want to show the item again
            div.style.display = "block";
            if (settings.useDebugMode) {
              div.style.backgroundColor = debugGreen;
              addDebugLabel(div, searchTerm);
            } else {
              removeDebugLabel(div, searchTerm);
            }
            return;
          }
        } else {
          // if personal block is not enabled then we want to show the item again
          div.style.display = "block";
          if (settings.useDebugMode) {
            div.style.backgroundColor = debugGreen;
            addDebugLabel(div, searchTerm);
          } else {
            removeDebugLabel(div, searchTerm);
            div.style.backgroundColor = "white";
          }
          return;
        }

        if (settings.useDebugMode) {
          addDebugLabel(div, searchTerm);
        } else {
          removeDebugLabel(div, searchTerm);
          div.style.backgroundColor = "white";
        }
        return;
      }
    }
  }

  if (settings.useDebugMode) {
    div.style.display = "block";
    div.style.backgroundColor = debugRed;
  } else {
    div.style.display = "none";
    div.style.backgroundColor = "white";
  }
};

const addDebugLabel = (div: HTMLDivElement, searchTerm: string) => {
  if (div.getElementsByClassName("ABF-" + searchTerm).length === 0) {
    var abflabel = document.createElement("span");
    abflabel.innerText = "ABF: " + searchTerm;
    abflabel.className = "ABF-" + searchTerm;
    abflabel.style.backgroundColor = "darkgreen";
    abflabel.style.color = "white";
    div.insertAdjacentElement("afterbegin", abflabel);
  }
};
const removeDebugLabel = (div: HTMLDivElement, searchTerm: string) => {
  if (div.getElementsByClassName("ABF-" + searchTerm).length > 0) {
    div.getElementsByClassName("ABF-" + searchTerm)[0]!.remove();
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
        div.style.backgroundColor = debugRed;
      } else {
        div.style.backgroundColor = "white";
      }
    }
  }
};

const updateDepartmentList = async () => {
  const departmentList = getDepartments();
  if (!departmentList) {
    return;
  }
  const syncKnownDepts = await getStorageValue("knownDepts", "sync");
  var currentDepts = <Record<string, boolean>>{};
  for (const dept of departmentList) {
    if (syncKnownDepts.knownDepts[dept] === false) {
      currentDepts[dept] = false;
    } else {
      currentDepts[dept] = true;
    }
  }
  await setStorageValue({ currentDepts: currentDepts }, "local");

  var updateDepartmentList = false;

  for (const dept of departmentList) {
    if (syncKnownDepts.knownDepts[dept] === undefined) {
      syncKnownDepts.knownDepts[dept] = true;
      updateDepartmentList = true;
    }
  }
  // only update if we found something new.  I suspect there may be optimization for this in the future rather than setting the entire list when we update it.
  if (updateDepartmentList) {
    await setStorageValue({ knownDepts: syncKnownDepts.knownDepts }, "local");
    await setStorageValue({ knownDepts: syncKnownDepts.knownDepts }, "sync");
    await setStorageValue({ deptCount: Object.keys(syncKnownDepts.knownDepts).length }, "local");
    await setStorageValue({ deptCount: Object.keys(syncKnownDepts.knownDepts).length }, "sync");
  }
};

const filterBrands = async (settings: StorageSettings) => {
  if (!settings.enabled) {
    return;
  }

  const { syncSettings } = await getSettings();

  const brands = settings.brandsMap;
  if (Object.keys(brands).length === 0) {
    console.debug("AmazonBrandFilter: No brands found");
    return;
  }
  if (settings.useDebugMode) {
    console.debug("AmazonBrandFilter: Brands found");
  }

  if (settings.refinerBypass) {
    return;
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
              div.style.display = "none";
            }
            continue;
          } else {
            div.style.display = "block";
            if (settings.useDebugMode) {
              div.style.backgroundColor = debugGreen;
            } else {
              div.style.backgroundColor = "white";
            }
            continue;
          }
        } else {
          div.style.display = "block";
          if (settings.useDebugMode) {
            div.style.backgroundColor = debugGreen;
          } else {
            div.style.backgroundColor = "white";
          }
          continue;
        }
      } else {
        if (settings.useDebugMode) {
          div.style.display = "block";
          div.style.backgroundColor = debugRed;
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
  updateDepartmentList();
  unHideDivs();
  await ensureSettingsExist();
  runFilter();
  listenForMessages();
  startObserver();

  console.log("AmazonBrandFilter: %cContent script loaded!", "color: lightgreen");
})();
