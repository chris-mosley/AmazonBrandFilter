import { getSettings, getStorageValue, setStorageValue } from "utils/browser-helpers";
import { getItemDivs, unHideDivs } from "utils/helpers";
import { StorageSettings } from "utils/types";

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

export const runFilterRefiner = async () => {
  const { settings, syncSettings } = await getSettings();
  if (!settings.enabled || !settings.filterRefiner) {
    return;
  }

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

export const filterBrands = async () => {
  const { settings, syncSettings } = await getSettings();
  if (!settings.enabled) {
    return;
  }

  const brands = settings.brandsMap;
  if (Object.keys(brands).length === 0) {
    return;
  }

  if (settings.refinerBypass) {
    return;
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

  const controlsIframe = document.getElementById("abf-controls-iframe") as HTMLIFrameElement | null;
  const itemsHiddenAfterFiltering = getItemDivs();
  let hiddenCount: number = 0;
  for (const div of itemsHiddenAfterFiltering) {
    if (div.style.display === "none") {
      hiddenCount += 1;
    }
  }
  if (hiddenCount === divs.length) {
    unHideDivs();
    if (!settings.allResultsFiltered) {
      await setStorageValue({ allResultsFiltered: true });
      controlsIframe?.contentWindow?.postMessage({ type: "allResultsFiltered", isChecked: true }, "*");
    }
  } else {
    if (settings.allResultsFiltered) {
      await setStorageValue({ allResultsFiltered: false });
      controlsIframe?.contentWindow?.postMessage({ type: "allResultsFiltered", isChecked: false }, "*");
    }
  }

  if (settings.filterRefiner) {
    runFilterRefiner();
  }
};

export const resetBrandsRefiner = () => {
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
export const resetBrands = () => {
  resetBrandsRefiner();
  resetBrandsSearchResults();
};

export const runFilter = async () => {
  const settings = await getStorageValue();
  if (!settings.enabled) {
    return;
  }

  const timerStart = performance.now();
  filterBrands();
  const timerEnd = performance.now();
  setStorageValue({ lastMapRun: timerEnd - timerStart });
};
