import { brandsUrl, defaultLocalStorageValue, defaultSyncStorageValue, latestReleaseUrl } from "utils/config";
import { getEngineApi, getSettings, getStorageValue, setIcon, setStorageValue } from "utils/browser-helpers";

const getBrandsListVersion = async () => {
  console.log("AmazonBrandFilter: %cChecking latest brands list version!", "color: yellow");
  const latestRelease = await fetch(latestReleaseUrl, { mode: "cors" })
    .then((response) => response.json())
    .catch((error) => {
      console.error(error, "AmazonBrandFilter: %cFailed fetching latest release!", "color: lightcoral");
      return defaultLocalStorageValue.brandsVersion;
    });

  const latestVersion = parseInt(latestRelease.tag_name.slice(1));
  return latestVersion;
};

const getBrandsListMap = async () => {
  console.log("AmazonBrandFilter: %cChecking brands list!", "color: lightgreen");
  const brandsListFetch: string[] = await fetch(brandsUrl)
    .then((res) => res.text())
    .then((text) => text.toUpperCase())
    .then((text) => text.split("\n"))
    .catch((err) => {
      console.error(err, "AmazonBrandFilter: %cFailed downloading brands list!", "color: lightcoral");
      return [];
    });

  let maxWordCount = 0;
  const brandsMap: Record<string, boolean> = {};
  const brandsCount = brandsListFetch.length;

  for (const brandName of brandsListFetch) {
    brandsMap[brandName] = true;
    const wordCount = brandName.split(" ").length;
    if (wordCount > maxWordCount) {
      maxWordCount = wordCount;
    }
  }

  console.log(`AmazonBrandFilter: Brands count is ${brandsCount}!`);
  console.log(`AmazonBrandFilter: Max brand word count is ${maxWordCount}!`);
  console.log(`AmazonBrandFilter: Showing brands list!`, brandsMap);
  return { brandsCount, maxWordCount, brandsMap };
};

const checkForBrandListUpdates = async () => {
  console.log("AmazonBrandFilter: %cChecking for updates!", "color: yellow");
  const { brandsVersion: currentVersion } = await getStorageValue("brandsVersion");
  const latestVersion = await getBrandsListVersion();
  if (currentVersion !== latestVersion) {
    const { brandsCount, maxWordCount, brandsMap } = await getBrandsListMap();
    // set local storage values only
    await setStorageValue({ brandsVersion: latestVersion, brandsCount, maxWordCount, brandsMap });
  }
};

const setStorageSettings = async () => {
  let syncValue: typeof defaultSyncStorageValue;
  let localValue: typeof defaultLocalStorageValue;

  const { isFirstRun } = await getStorageValue("isFirstRun");
  if (isFirstRun) {
    console.log("AmazonBrandFilter: %cFirst run, setting defaults!", "color: yellow");
    syncValue = defaultSyncStorageValue;
    localValue = defaultLocalStorageValue;
  } else {
    // handle case where no default values exist when !isFirstRun
    const { settings, syncSettings } = await getSettings();

    // defaults destructured first to ensure that settings that have been set are not overwritten
    syncValue = { ...defaultSyncStorageValue, ...syncSettings };
    localValue = { ...defaultLocalStorageValue, ...settings };
  }

  const { brandsVersion: currentVersion } = await getStorageValue("brandsVersion");
  const latestVersion = await getBrandsListVersion();
  if (currentVersion !== latestVersion) {
    const { brandsCount, maxWordCount, brandsMap } = await getBrandsListMap();
    // set local storage values only
    localValue = { ...localValue, brandsVersion: latestVersion, brandsCount, maxWordCount, brandsMap };
  }

  await setStorageValue(syncValue, "sync", "overwrite");
  await setStorageValue(localValue, "local", "overwrite");
};

(async () => {
  await setStorageSettings();
  setIcon();
  setInterval(checkForBrandListUpdates, 86_400_000); // check for updates once everyday
})();

// listen for extension install/update
getEngineApi().runtime.onInstalled.addListener(async (details) => {
  console.log(`AmazonBrandFilter: %c${details.reason}`, "color: yellow");
});

// listen for storage changes
getEngineApi().storage.onChanged.addListener(async (_changes, _areaName) => {
  setIcon();
});
