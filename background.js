async function checkBrandsVersion(){
  while (true) {
    console.log("AmazonBrandFilter: Checking latest brands list version");
    
    var currentVersion = await getCurrentBrandsVersion().then(function(version){return version;});
    var latestReleaseUrl = 'https://api.github.com/repos/chris-mosley/AmazonBrandFilterList/releases/latest';
    var latestRelease = await fetch(versionUrl, {mode: 'cors'})
      .then(response => response.json())
    var latestVersion = latestRelease.name;
    var latestTag = latestRelease.tag_name;
    
    console.log("AmazonBrandFilter: Latest brands list version is " + latestVersion);
    console.log("AmazonBrandFilter: Current brands list version is " + currentVersion);
    
    if (currentVersion != latestVersion){
        console.log("AmazonBrandFilter: Downloading latest brands list");
        updateBrandList(latestTag);
        browser.storage.local.set({"brandsVersion": latestVersion});
    }
    
    console.log("AmazonBrandFilter: backgroup.js sleeping for one day");
    await sleep(86400000);
  }
}



async function updateBrandList(tag){
  console.log("AmazonBrandFilter: Starting updateBrandList");

  var brandsUrl = `https://raw.githubusercontent.com/chris-mosley/AmazonBrandFilterList/${tag}/brands.txt`
  var brandsGet = await fetch(brandsUrl, {mode: 'cors'})
    .then(response => response.text())
    .then(text => text.toUpperCase())
    .then(text => text.split("\n"))
    

  console.log("AmazonBrandFilter: Brands are " + brandsGet);
  browser.storage.local.set({"brandsList": brandsGet});
  
}

async function getCurrentBrandsVersion(){

  await browser.storage.local.get("brandsVersion").then(function(result){
    console.log("AmazonBrandFilter: Current brands version is " + result.brandsVersion);

    var version = result.brandsVersion;
    return versionInt})
  }



function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function setIcon(){
  await browser.storage.local.get("abf-enabled").then(function(enabled){
  if(enabled){
    browser.action.setIcon({
      path: {
        48: "icons/abf-enabled-128.png"
      }
    });
  }
  else{
    browser.action.setIcon({
      path: {
        48: "icons/abf-disabled-128.png"
      }
    });
  }
});
}

// set the icon the first time the extension is loaded
setIcon();
// Start checking for updates
checkBrandsVersion();
