import { browser } from "webextension-polyfill-ts";

const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// const getCurrentBrandsVersion = async () => {
//   const mapStatus = await browser.storage.local.get("brandsMap");
//   if (mapStatus.brandsMap == undefined) {
//     // if the map is undefined lets make sure to update regardless of version
//     return 0;
//   }
//   const result = await browser.storage.local.get("brandsVersion");
//   console.log("AmazonBrandFilter: Current brands version is " + result.brandsVersion);
//   return result.brandsVersion;
// }

const getFirstRun = async () => {
  const result = await browser.storage.local.get("abfFirstRun");
  console.log("AmazonBrandFilter: first run status is: " + result.abfFirstRun);
  return result.abfFirstRun;
};

const checkBrandsVersion = async () => {
  console.log("AmazonBrandFilter: Checking latest brands list version");
  // var currentVersion = await getCurrentBrandsVersion();
  const currentVersion = 0;
  const latestReleaseUrl = "https://api.github.com/repos/chris-mosley/AmazonBrandFilterList/releases/latest";
  const latestRelease = await fetch(latestReleaseUrl, { mode: "cors" }).then((response) => response.json());
  const latestVersion = parseInt(latestRelease.tag_name.slice(1));

  console.log("AmazonBrandFilter: Latest brands list version is " + latestVersion);
  console.log("AmazonBrandFilter: Current brands list version is " + currentVersion);

  if (currentVersion != latestVersion) {
    console.log("AmazonBrandFilter: Downloading latest brands list");
    try {
      // updateBrandList();
      updateBrandMap();
    } catch (err) {
      console.error("AmazonBrandFilter: Error downloading brands list");
      return;
    }
    browser.storage.local.set({ brandsVersion: latestVersion });
  }

  console.log("AmazonBrandFilter: background.js sleeping for one day");
  await sleep(86400000);
  checkBrandsVersion();
};

// const updateBrandList = async () => {
//   console.log("AmazonBrandFilter: Starting updateBrandList");
//   const brandsUrl = "https://raw.githubusercontent.com/chris-mosley/AmazonBrandFilterList/main/brands.txt";
//   let brandsGet: string[] = [];
//   try {
//     brandsGet = await fetch(brandsUrl, { mode: "cors" })
//       .then((response) => response.text())
//       .then((text) => text.toUpperCase())
//       .then((text) => text.split("\n"));
//   } catch (err) {
//     console.error("AmazonBrandFilter: Error downloading brands list");
//     return;
//   }
//   browser.storage.local.set({ brandsCount: brandsGet.length });
//   console.log("AmazonBrandFilter: Brands count is " + brandsGet.length);
//   console.log("AmazonBrandFilter: Brands are " + brandsGet);
//   browser.storage.local.set({ brandsList: brandsGet });
// }

const updateBrandMap = async () => {
  console.log("AmazonBrandFilter: Starting updateBrandList");

  const brandsUrl = "https://raw.githubusercontent.com/chris-mosley/AmazonBrandFilterList/main/brands.txt";

  let brandsGet: string[] = [];
  try {
    brandsGet = await fetch(brandsUrl, { mode: "cors" })
      .then((response) => response.text())
      .then((text) => text.toUpperCase())
      .then((text) => text.split("\n"));
  } catch (err) {
    console.error("AmazonBrandFilter: Error downloading brands list");
    return;
  }
  let brandsMap = {};
  for (let i = 0; i < brandsGet.length; i++) {
    console.debug("AmazonBrandFilter: Adding " + brandsGet[i] + " to brands list");
    // protect against possible empty lines in the list
    if (brandsGet[i]) {
      brandsMap = {
        ...brandsMap,
        [brandsGet[i]]: true,
      };
    }
  }

  console.log("AmazonBrandFilter: Brands count is " + brandsGet.length);

  browser.storage.local.set({ brandsMap: brandsMap });

  const keys = Object.keys(brandsMap);
  let maxWordCount = 0;
  for (let i = 0; i < keys.length; i++) {
    if (keys[i].split(" ").length > maxWordCount) {
      maxWordCount = keys[i].split(" ").length;
    }
  }
  browser.storage.local.set({ maxWordCount: maxWordCount });
  console.log("AmazonBrandFilter: Max brand word count is " + maxWordCount);
  console.log("AmazonBrandFilter: Brands are " + keys);
  browser.storage.local.set({ brandsCount: keys.length });
};

// const createBrandMap = (wordList, depth=0) => {
//   if(depth == wordList.length - 1){
//     return true;
//   }
//   var brandMap = {};
//   brandMap[wordList[depth+1]] = createBrandMap(wordList, depth + 1);
//   return brandMap;
// }

const setIcon = async () => {
  const result = await browser.storage.local.get("abf-enabled");
  if (result.enabled) {
    browser.action.setIcon({
      path: {
        48: "icons/abf-enabled-128.png",
      },
    });
  } else {
    browser.action.setIcon({
      path: {
        48: "icons/abf-disabled-128.png",
      },
    });
  }
};

(async () => {
  // set the default values for the extension
  if ((await getFirstRun()) != false) {
    console.log("AmazonBrandFilter: First run, setting defaults");
    browser.storage.local.set({ enabled: true });
    browser.storage.local.set({ brandsVersion: 0 });
    browser.storage.local.set({ brandsCount: 0 });
    browser.storage.local.set({ brandsMap: {} });
    browser.storage.local.set({ refinerBypass: true });
    browser.storage.local.set({ abfFirstRun: false });
  } else {
    console.log("AmazonBrandFilter: Not first run");
  }
})();

// set the icon the first time the extension is loaded
setIcon();
// Start checking for updates
checkBrandsVersion();
