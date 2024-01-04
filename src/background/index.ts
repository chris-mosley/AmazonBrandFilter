import { defaultLocalStorageValue, defaultSyncStorageValue, latestReleaseUrl } from "utils/config";
import { getStorageValue, setIcon, setStorageValue } from "utils/helpers";

const getIsFirstRun = async () => {
  const { isFirstRun } = await getStorageValue("isFirstRun");
  return isFirstRun;
};

const getCurrentBrandsVersion = async () => {
  const { brandsVersion } = await getStorageValue("brandsVersion");
  return brandsVersion;
};

const checkbrandsListVersion = async () => {
  console.log("AmazonBrandFilter: %cChecking latest brands list version!", "color: yellow");

  // Fetch latest brands list release
  const latestRelease = await fetch(latestReleaseUrl, { mode: "cors" })
    .then((response) => response.json())
    .catch((error) =>
      console.error(error, "AmazonBrandFilter: %cFailed fetching latest release!", "color: lightcoral")
    );

  // Current / Latest versions
  const currentVersion = await getCurrentBrandsVersion();
  const latestVersion = parseInt(latestRelease.tag_name.slice(1));

  // Check if current version match the latest version
  if (!currentVersion || currentVersion !== latestVersion) {
    console.log(
      `AmazonBrandFilter: %cCurrent version does not match latest version!`,
      "color: lightcoral",
      `\nAmazonBrandFilter: Current ${currentVersion} | Latest ${latestVersion}`
    );

    // Update
    updateBrandsListMap();
    setStorageValue({ brandsVersion: latestVersion });
  } else {
    console.log(
      `AmazonBrandFilter: %cCurrent version match latest version!`,
      "color: lightgreen",
      `\nAmazonBrandFilter: Current ${currentVersion} | Latest ${latestVersion}`
    );
  }

  // Sleep
  console.log("AmazonBrandFilter: background.js is sleeping for one day!");
  setTimeout(checkbrandsListVersion, 86_400_000);
};

const updateBrandsListMap = async () => {
  console.log("AmazonBrandFilter: %cUpdating brands list!", "color: lightgreen");

  // Fetch latest brands list release
  const brandsUrl = "https://raw.githubusercontent.com/chris-mosley/AmazonBrandFilterList/main/brands.txt";
  const brandsListFetch: string[] = await fetch(brandsUrl)
    .then((res) => res.text())
    .then((text) => text.toUpperCase())
    .then((text) => text.split("\n"))
    .catch((err) => {
      console.error(err, "AmazonBrandFilter: %cFailed downloading brands list!", "color: lightcoral");
      return [];
    });

  let maxWordCount = 0;
  const brandsMap: { [key: string]: boolean } = {},
    brandsCount = brandsListFetch.length;

  // Build the brands list map
  for (const brandName of brandsListFetch) {
    console.debug(`AmazonBrandFilter: Adding ${brandName} to the list!`);

    // Append key-value pair to brandsMap
    brandsMap[brandName] = true;

    // Check for max word count
    const wordCount = brandName.split(" ").length;
    if (wordCount > maxWordCount) maxWordCount = wordCount;
  }

  // Browser local storage saves
  setStorageValue({
    brandsMap,
    brandsCount,
    maxWordCount,
  });

  console.log(`AmazonBrandFilter: Brands count is ${brandsCount}!`);
  console.log(`AmazonBrandFilter: Max brand word count is ${maxWordCount}!`);
  console.log(`AmazonBrandFilter: Showing brands list!`, brandsMap);
};

(async () => {
  if (await getIsFirstRun()) {
    console.log("AmazonBrandFilter: %cFirst run, setting defaults!", "color: yellow");
    setStorageValue(defaultSyncStorageValue, "sync");
    setStorageValue(defaultLocalStorageValue);
  } else {
    // handle case where no default values exist when !isFirstRun
    // attempt to get sync settings first
    let syncSettings = await getStorageValue("sync");
    if (Object.keys(syncSettings).length === 0) {
      syncSettings = await getStorageValue();
    }

    // set for both sync and local
    // defaults destructured first to ensure that settings that have been set are not overwritten
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { brandsMap, ...filteredSyncSettings } = syncSettings; // don't copy brandsMap for sync
    setStorageValue(
      {
        ...defaultSyncStorageValue,
        ...filteredSyncSettings,
      },
      "sync"
    );
    setStorageValue({
      ...defaultLocalStorageValue,
      ...syncSettings,
    });
  }

  setIcon(); // Set the icon the first time the extension is loaded
  checkbrandsListVersion(); // Periodically check for updates once everyday
})();
