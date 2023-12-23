import { getStorageValue, setIcon, setStorageValue } from "utils/helpers";

const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// const getCurrentBrandsVersion = async () => {
//   const mapStatus = await getStorageValue("brandsMap");
//   if (mapStatus.brandsMap == undefined) {
//     // if the map is undefined lets make sure to update regardless of version
//     return 0;
//   }
//   const result = await getStorageValue("brandsVersion");
//   console.log("AmazonBrandFilter: Current brands version is " + result.brandsVersion);
//   return result.brandsVersion;
// }

const getFirstRun = async () => {
  const result = await getStorageValue("abfFirstRun");
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
    setStorageValue({ brandsVersion: latestVersion });
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
//   setStorageValue({ brandsCount: brandsGet.length });
//   console.log("AmazonBrandFilter: Brands count is " + brandsGet.length);
//   console.log("AmazonBrandFilter: Brands are " + brandsGet);
//   setStorageValue({ brandsList: brandsGet });
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

  setStorageValue({ brandsMap: brandsMap });

  const keys = Object.keys(brandsMap);
  let maxWordCount = 0;
  for (let i = 0; i < keys.length; i++) {
    if (keys[i].split(" ").length > maxWordCount) {
      maxWordCount = keys[i].split(" ").length;
    }
  }
  setStorageValue({ maxWordCount: maxWordCount });
  console.log("AmazonBrandFilter: Max brand word count is " + maxWordCount);
  console.log("AmazonBrandFilter: Brands are " + keys);
  setStorageValue({ brandsCount: keys.length });
};

// const createBrandMap = (wordList, depth=0) => {
//   if(depth == wordList.length - 1){
//     return true;
//   }
//   var brandMap = {};
//   brandMap[wordList[depth+1]] = createBrandMap(wordList, depth + 1);
//   return brandMap;
// }

(async () => {
  // set the default values for the extension
  if ((await getFirstRun()) != false) {
    console.log("AmazonBrandFilter: First run, setting defaults");
    setStorageValue({ enabled: true });
    setStorageValue({ brandsVersion: 0 });
    setStorageValue({ brandsCount: 0 });
    setStorageValue({ brandsMap: {} });
    setStorageValue({ refinerBypass: true });
    setStorageValue({ abfFirstRun: false });
  } else {
    console.log("AmazonBrandFilter: Not first run");
  }
})();

// set the icon the first time the extension is loaded
setIcon();
// Start checking for updates
checkBrandsVersion();
