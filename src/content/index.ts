import { getItemDivs, getStorageValue, setStorageValue, sleep, unHideDivs } from "utils/helpers";

unHideDivs();

getStorageValue().then((settings) => {
  if (settings.enabled) {
    let previousUrl = "";
    const observer = new MutationObserver((_mutations) => {
      if (location.href !== previousUrl) {
        previousUrl = location.href;
        sleep(1000).then(() => {
          const timerStart = performance.now();
          filterBrands(settings);
          const timerEnd = performance.now();
          setStorageValue({ lastMapRun: timerEnd - timerStart });
        });
      }
    });

    const config = { attributes: true, childList: true, subtree: true };
    observer.observe(document, config);
  }
});

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

  for (let i = 0; i < boxes.length; i++) {
    if (boxes[i].checked) {
      return true;
    }
  }
  return false;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const filterBrands = async (settings: any) => {
  const synchedSettings = await getStorageValue("sync");
  console.log("AmazonBrandFilter: synchedSettings are: " + JSON.stringify(synchedSettings));
  console.log("AmazonBrandFilter: Starting filterBrands");
  const brands = settings.brandsMap;
  console.log("AmazonBrandFilter: Brands are " + JSON.stringify(brands));
  if (brands.length != 0) {
    console.log("AmazonBrandFilter: Brands found");
  } else {
    console.log("AmazonBrandFilter: No brands found");
    return;
  }

  if (settings.refinerBypass) {
    if (checkBrandFilter()) {
      return;
    }
  }

  const divs = getItemDivs();
  for (let i = 0; i < divs.length; i++) {
    const itemHeader = divs[i].getElementsByClassName("s-line-clamp-1") as HTMLCollectionOf<HTMLDivElement>;
    if (itemHeader.length != 0) {
      const searchTerm = itemHeader[0].innerText.toUpperCase();
      if (settings.brandsMap[searchTerm]) {
        if (synchedSettings.usePersonalBlock == true) {
          if (synchedSettings.personalBlockMap[searchTerm]) {
            if (settings.useDebugMode) {
              // to make it easier to tell when something is hidden because
              // it isnt found vs when it is hidden because it is blocked
              divs[i].style.backgroundColor = "yellow";
              divs[i].innerHTML =
                "<span style='color: black; background-color: white;font-size: large;'>ABF DEBUG: " +
                searchTerm +
                "</span><br>" +
                divs[i].innerHTML;
              continue;
            } else {
              divs[i].style.display = "none";
            }
          }
        } else {
          if (settings.useDebugMode) {
            divs[i].style.backgroundColor = "green";
            divs[i].innerHTML =
              "<span style='color: black; background-color: white;font-size: large;'>ABF DEBUG: " +
              searchTerm +
              "</span><br>" +
              divs[i].innerHTML;
          }
          continue;
        }
      } else {
        if (settings.useDebugMode) {
          divs[i].style.backgroundColor = "red";
        } else {
          divs[i].style.display = "none";
        }
        continue;
      }
    }

    const shortText = divs[i].getElementsByClassName("a-color-base a-text-normal") as HTMLCollectionOf<HTMLDivElement>;
    if (shortText.length == 0) {
      continue;
    }
    if (shortText.length == 0) {
      continue;
    }
    await descriptionSearch(settings, divs[i]);
  }

  if (settings.filterRefiner) {
    filterRefiner(settings, synchedSettings);
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const descriptionSearch = async (settings: any, div: HTMLDivElement) => {
  const synchedSettings = await getStorageValue("sync");
  console.log("AmazonBrandFilter: synchedSettings are: " + JSON.stringify(synchedSettings));
  const shortText = div.getElementsByClassName("a-color-base a-text-normal") as HTMLCollectionOf<HTMLDivElement>;
  if (shortText.length == 0) {
    return;
  }
  const fullText = shortText[0].innerText.toUpperCase();
  const wordList = fullText.replace(", ", " ").split(" ").slice(0, 8);
  for (let w = 0; w < settings.maxWordCount + 3; w++) {
    for (let x = 0; x < wordList.length; x++) {
      const searchTerm = wordList.slice(x, w).join(" ");
      if (searchTerm.length == 0) {
        continue;
      }
      if (settings.brandsMap[searchTerm]) {
        // check to see if each word is in the map.  if we dont stop then we hide it.
        if (synchedSettings.usePersonalBlock) {
          if (synchedSettings.personalBlockMap[searchTerm]) {
            if (settings.useDebugMode) {
              // to make it easier to tell when something is hidden because
              // it isnt found vs when it is hidden because it is blocked
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
          div.style.backgroundColor = "green";
          div.innerHTML =
            "<span style='color: black; background-color: white;font-size: large;'>ABF DEBUG: " +
            searchTerm +
            "</span><br>" +
            div.innerHTML;
        }
        return;
      }
    }
  }
  if (settings.useDebugMode) {
    div.style.backgroundColor = "red";
  } else {
    div.style.display = "none";
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const filterRefiner = (settings: any, syncSettings: any) => {
  const refiner = document.getElementById("brandsRefinements");
  if (!refiner) {
    return;
  }
  const divs = refiner.getElementsByClassName("a-spacing-micro") as HTMLCollectionOf<HTMLDivElement>;

  for (let i = 0; i < divs.length; i++) {
    const brand = (
      divs[i].getElementsByClassName("a-size-base a-color-base") as HTMLCollectionOf<HTMLDivElement>
    )[0].innerText.toUpperCase();
    if (brand.length == 0) {
      continue;
    }

    if (!settings.brandsMap[brand]) {
      if (settings.useDebugMode) {
        divs[i].style.backgroundColor = "red";
      } else {
        if (settings.refinerMode == "grey") {
          divs[i].getElementsByClassName("a-size-base a-color-base")[0].setAttribute("style", "color:grey !important");
        } else {
          divs[i].style.display = "none";
        }
      }
    }
    if (syncSettings.usePersonalBlock && syncSettings.personalBlockMap[brand]) {
      if (settings.useDebugMode) {
        divs[i].style.backgroundColor = "yellow";
      } else {
        if (settings.refinerMode == "grey") {
          divs[i].getElementsByClassName("a-size-base a-color-base")[0].setAttribute("style", "color:grey !important");
        } else {
          divs[i].style.display = "none";
        }
      }
    }
  }
};
