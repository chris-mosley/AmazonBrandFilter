// ============================ //
//      BACKGROUND START        //
// ============================ //
// Check if this is the first run!
if (!(await getFirstRun())) {
  console.log("AmazonBrandFilter: %cFirst run, setting defaults!", "color: yellow");

  browser.storage.local.set({ enabled: false });
  browser.storage.local.set({ brandsVersion: 0 });
  browser.storage.local.set({ brandsCount: 0 });
  browser.storage.local.set({ brandsMap: {} });
  browser.storage.local.set({ refinerBypass: true });
  browser.storage.local.set({ abfFirstRun: false });
} else {
  console.log("AmazonBrandFilter: Not first run!");
}

// Set the icon the first time the extension is loaded
setIcon();
// Check for updates in the background once everyday
checkBrandsListVersion()

// ========================== //
//      INIT FUNCTIONS        //
// ========================== //

async function getFirstRun() {
  const { abfFirstRun } = await browser.storage.local.get("abfFirstRun");
  console.debug(`AmazonBrandFilter: First run status is ${abfFirstRun}`);
  return abfFirstRun ? true : false;
}

async function setIcon() {
  const { enabled } = await browser.storage.local.get("enabled");

  if (enabled) {
    browser.action.setIcon({
      path: {
        128: "icons/abf-enabled-128.png",
      },
    });
  } else {
    browser.action.setIcon({
      path: {
        128: "icons/abf-disabled-128.png",
      },
    });
  }
}

async function checkBrandsListVersion(callDelay = 8.64e+7) {
  console.log("AmazonBrandFilter: Checking for updates!");

  const brandLatestReleaseUrl = "https://api.github.com/repos/chris-mosley/AmazonBrandFilterList/releases/latest";
  const currentBrandsVersion = await getCurrentBrandsVersion();

  const latestBrandRelease = await fetch(brandLatestReleaseUrl)
    .then((r) => r.json())
    .catch((e) => {
      console.error(e, "Failed fetching the latest release!");
    });

  const latestBrandsVersion = parseInt(latestBrandRelease.tag_name.slice(1));

  let brandsMap = {};
  if (currentBrandsVersion != latestBrandsVersion) {
    console.log(
      "AmazonBrandFilter: %cCurrent version does not match the latest version!",
      "color: lightcoral",
      `\nAmazonBrandFilter: Current: ${currentBrandsVersion} Latest: ${latestBrandsVersion}`
    );

    // Set the latest version as current then download the latest brand list
    browser.storage.local.set({ brandsVersion: latestBrandsVersion });
    brandsMap = await downloadBrandList();
  } else {
    console.log("AmazonBrandFilter: %cCurrent version match the latest version!", "color: lightgreen");

    // Load the brand list from the local storage
    brandsMap = { brandsMap } = await browser.storage.local.get("brandsMap");
  }

  // This is similar to the sleep() function you made. It simplifies the
  // logic needed and removes the while() loop and also no, this isn't
  // recursion or at least they call it  "pseudo-recursion" which doesn't 
  // add anything to the stack.
  console.log("AmazonBrandFilter:\n[Background.js] Sleeping for one day!")
  setTimeout(checkBrandsListVersion, callDelay);
}

// ============================ //
//      HELPER FUNCTIONS        //
// ============================ //

async function getCurrentBrandsVersion() {
  const { brandsVersion } = await browser.storage.local.get("brandsVersion");
  return brandsVersion ?? 0;
}

async function downloadBrandList() {
  console.log("AmazonBrandFilter: %cDownloading new release!", "color: lightgreen");
  const brandsListUrl = "https://raw.githubusercontent.com/chris-mosley/AmazonBrandFilterList/main/brands.txt";

  // Fetch the brand list AS A TEXT FILE!
  const brandsListFetch = await fetch(brandsListUrl)
    .then((r) => r.text())
    .then((t) => t.split("\n"))
    .catch((e) => {
      console.error(e, "AmazonBrandFilter: Failed downloading brands list!");
    });

  let maxWordCount = 0,
    brandsListMap = {},
    brandsCount = 0;

  // Build the brands list map
  for (const brandName of brandsListFetch) {
    console.debug(`AmazonBrandFilter: Adding ${brandName} to brands list!`);
    // Append key-value to brand list map
    brandsListMap[brandName] = true;

    // Check for the max word count
    if (brandName.split(" ").length > maxWordCount) {
      maxWordCount = brandName.split(" ").length;
    }

    // brandsListMap.length returns undefined
    // Add 1 to brandsCount for every brand
    brandsCount += 1;
  }

  // Save items to local storage
  browser.storage.local.set({ brandsMap: brandsListMap });
  browser.storage.local.set({ maxWordCount: maxWordCount });
  browser.storage.local.set({ brandsCount: brandsCount });

  // Console logs
  console.log(`AmazonBrandFilter: Brands count is ${brandsCount}!`);
  console.log(`AmazonBrandFilter: Max brand word count is ${maxWordCount}!`);
  console.log("AmazonBrandFilter: Showing brand list:", brandsListMap);

  return brandsListMap;
}
