import { PopupMessage, StorageSettings } from "utils";
import { getEngineApi, getItemDivs, getStorageValue, setStorageValue, sleep, unHideDivs } from "utils/helpers";

const checkBrandFilter = (): boolean => {
  const boxesdiv = document.getElementById("brandsRefinements")!.children;
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
  const synchedSettings = await getStorageValue("sync");
  const shortText = div.getElementsByClassName("a-color-base a-text-normal") as HTMLCollectionOf<HTMLDivElement>;
  if (shortText.length === 0) {
    return;
  }
  const fullText = shortText[0]?.innerText.toUpperCase() ?? "";
  const wordList = fullText.replace(", ", " ").split(" ").slice(0, 8);
  for (let w = 0; w < settings.maxWordCount + 3; w++) {
    for (let x = 0; x < wordList.length; x++) {
      const searchTerm = wordList.slice(x, w).join(" ");
      if (searchTerm.length === 0) {
        continue;
      }
      if (settings.brandsMap[searchTerm]) {
        // check to see if each word is in the map.  if we dont stop then we hide it.
        if (synchedSettings.usePersonalBlock) {
          if (synchedSettings.personalBlockMap[searchTerm]) {
            if (settings.useDebugMode) {
              // to make it easier to tell when something is hidden because
              // it isnt found vs when it is hidden because it is blocked
              div.style.display = "block";
              div.style.backgroundColor = "yellow";
              div.innerHTML =
                "<span style='color: black; background-color: white;font-size: large;'>ABF DEBUG: " +
                searchTerm +
                "</span><br>" +
                div.innerHTML;
            } else {
              div.style.display = "none";
            }
            return;
          }
        }
        if (settings.useDebugMode) {
          div.style.display = "block";
          div.style.backgroundColor = "green";
          div.innerHTML =
            "<span style='color: black; background-color: white;font-size: large;'>ABF DEBUG: " +
            searchTerm +
            "</span><br>" +
            div.innerHTML;
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

const filterRefiner = (settings: StorageSettings, syncSettings: StorageSettings) => {
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
          ?.setAttribute("style", "display: block; color: grey !important;");
      } else {
        div.style.display = "none";
        div
          .getElementsByClassName("a-size-base a-color-base")[0]
          ?.setAttribute("style", "display: block; color: black !important;");
      }

      if (settings.useDebugMode) {
        div.style.display = "block";
        div.style.backgroundColor = "red";
      } else {
        div.style.backgroundColor = "white";
      }
    }
  }
};

const filterBrands = async (settings: StorageSettings) => {
  // do nothing if the extension is disabled
  if (!settings.enabled) {
    return;
  }

  const synchedSettings = await getStorageValue("sync");
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
        if (synchedSettings.usePersonalBlock) {
          if (synchedSettings.personalBlockMap[searchTerm]) {
            if (settings.useDebugMode) {
              // to make it easier to tell when something is hidden because
              // it isnt found vs when it is hidden because it is blocked
              div.style.display = "block";
              div.style.backgroundColor = "yellow";
              div.innerHTML =
                "<span style='color: black; background-color: white;font-size: large;'>ABF DEBUG: " +
                searchTerm +
                "</span><br>" +
                div.innerHTML;
              continue;
            } else {
              div.style.display = "none";
            }
          }
        } else {
          if (settings.useDebugMode) {
            div.style.display = "block";
            div.style.backgroundColor = "green";
            div.innerHTML =
              "<span style='color: black; background-color: white;font-size: large;'>ABF DEBUG: " +
              searchTerm +
              "</span><br>" +
              div.innerHTML;
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
    filterRefiner(settings, synchedSettings);
  }
};

/**
 * resets the brands filter to the default Amazon settings (colors and display)
 */
const resetBrands = () => {
  // reset sidebar
  let divs = [];
  divs = [
    ...(document.getElementById("brandsRefinements")?.getElementsByClassName("a-spacing-micro") ?? []),
  ] as HTMLDivElement[];
  divs.forEach((div) => {
    div.style.backgroundColor = "white";
    div
      .getElementsByClassName("a-size-base a-color-base")[0]
      ?.setAttribute("style", "display: block; color: black !important;");
    div.style.display = "block";
  });
  // reset search results
  divs = [...getItemDivs()] as HTMLDivElement[];
  divs.forEach((div) => {
    div.style.backgroundColor = "white";
    div.style.display = "block";
  });
};

const listenForMessages = () => {
  getEngineApi().runtime.onMessage.addListener(async (message: PopupMessage) => {
    console.log({ type: message.type, isChecked: message.isChecked });
    const settings = await getStorageValue();
    const synchedSettings = await getStorageValue("sync");
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
      case "refinerMode":
        filterRefiner(settings, synchedSettings);
        break;
      default:
        break;
    }
  });
};

(async () => {
  // listen for messages from the popup
  listenForMessages();

  unHideDivs();

  let previousUrl = "";
  const observer = new MutationObserver(async (_mutations) => {
    if (location.href === previousUrl) {
      return;
    }
    previousUrl = location.href;

    const settings = await getStorageValue();
    if (!settings.enabled) {
      return;
    }

    await sleep(1000);
    const timerStart = performance.now();
    filterBrands(settings);
    const timerEnd = performance.now();
    setStorageValue({ lastMapRun: timerEnd - timerStart });
  });

  const config = { attributes: true, childList: true, subtree: true };
  observer.observe(document, config);
})();
