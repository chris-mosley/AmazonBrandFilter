// ============================ //
//      BACKGROUND START        //
// ============================ //
// Check if this is the first run!
if (await getFirstRun()) {
  console.log(
    "AmazonBrandFilter: %cFirst run, setting defaults!",
    "color: yellow"
  );

  browser.storage.local.set({ enabled: true });
  browser.storage.local.set({ brandsVersion: 0 });
  browser.storage.local.set({ brandsCount: 0 });
  browser.storage.local.set({ brandsMap: {} });
  browser.storage.local.set({ refinerBypass: true });
  browser.storage.local.set({ abfFirstRun: false });
} else {
  console.log("AmazonBrandFilter: %cNot first run!", "color: yellow");
}

// Set the icon the first time the extension is loaded
setIcon();
// Periodically check for updates once everyday
checkBrandsListVersion();

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

async function checkBrandsListVersion(callDelay = 8.64e7) {
  console.log("AmazonBrandFilter: Checking for updates!");

  const brandLatestReleaseUrl = "https://api.github.com/repos/chris-mosley/AmazonBrandFilterList/releases/latest";
  const currentBrandsVersion = await getCurrentBrandsVersion();

  const latestBrandRelease = await fetch(brandLatestReleaseUrl)
    .then((r) => r.json())
    .catch((e) => {
      console.error(e, "Failed fetching the latest release!");
    });

  const latestBrandsVersion = parseInt(latestBrandRelease.tag_name.slice(1));

  if (currentBrandsVersion != latestBrandsVersion) {
    console.log(
      "AmazonBrandFilter: %cCurrent version does not match the latest version!",
      "color: lightcoral",
      `\nAmazonBrandFilter: Current: ${currentBrandsVersion} | Latest: ${latestBrandsVersion}`
    );

    // Set the latest version as current then download the latest brand list
    browser.storage.local.set({ brandsVersion: latestBrandsVersion });

    // Download the latest brands list
    downloadBrandList();
  } else {
    console.log(
      "AmazonBrandFilter: %cCurrent version match the latest version!",
      "color: lightgreen",
      `\nAmazonBrandFilter: Current: ${currentBrandsVersion} | Latest: ${latestBrandsVersion}`
    );
  }

  // This is similar to the sleep() function you made. It simplifies the
  // logic needed and removes the while() loop and also no, this isn't
  // recursion or at least they call it "pseudo-recursion" which doesn't
  // add anything to the stack.
  //
  // https://stackoverflow.com/questions/6685396/execute-the-setinterval-function-without-delay-the-first-time
  console.log(`AmazonBrandFilter: [Background.js] Sleeping!`);
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
  console.log(
    "AmazonBrandFilter: %cDownloading new release!",
    "color: lightgreen"
  );

  const brandsListUrl = "https://raw.githubusercontent.com/chris-mosley/AmazonBrandFilterList/main/brands.txt";

  // Fetch the brand list AS A TEXT FILE!
  const brandsListFetch = await fetch(brandsListUrl)
    .then((r) => r.text())
    .then((t) => t.split("\n"))
    .catch((e) => {
      console.error(e, "AmazonBrandFilter: Failed downloading brands list!");
    });

  // Initialize variables
  let maxWordCount = 0,
    brandsListMap = {};

  // Set brands list count
  const brandsCount = brandsListFetch.length

  // Build the brands list map
  for (const brandName of brandsListFetch) {
    console.debug(`AmazonBrandFilter: Adding ${brandName} to brands list!`);

    // Append key-value to brand list map
    brandsListMap[brandName] = true;

    // Check for the max word count
    if (brandName.split(" ").length > maxWordCount) {
      maxWordCount = brandName.split(" ").length;
    }
  }

  // Save items to local storage
  browser.storage.local.set({ brandsMap: brandsListMap });
  browser.storage.local.set({ maxWordCount: maxWordCount });
  browser.storage.local.set({ brandsCount: brandsCount });

  // Console logs
  console.log(`AmazonBrandFilter: Brands count is ${brandsCount}!`);
  console.log(`AmazonBrandFilter: Max brand word count is ${maxWordCount}!`);
  console.log("AmazonBrandFilter: Showing brand list:", brandsListMap);
}
