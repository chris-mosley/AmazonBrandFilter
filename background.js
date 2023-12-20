function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getCurrentBrandsVersion(){
  
  
  let mapStatus = await browser.storage.local.get("brandsMap");
  if(mapStatus.brandsMap == undefined){
    // if the map is undefined lets make sure to update regardless of version
    return 0;
  }
  let result = await browser.storage.local.get("brandsVersion");
  console.log("AmazonBrandFilter: Current brands version is " + result.brandsVersion);
  return result.brandsVersion
}

async function getFirstRun(){
  let result = await browser.storage.local.get("abfFirstRun");
  console.log("AmazonBrandFilter: first run status is: " + result.abfFirstRun);
  return result.abfFirstRun;
}

async function checkBrandsVersion(){
  while (true) {
    console.log("AmazonBrandFilter: Checking latest brands list version");
    // var currentVersion = await getCurrentBrandsVersion();
    var currentVersion = 0;
    var latestReleaseUrl = 'https://api.github.com/repos/chris-mosley/AmazonBrandFilterList/releases/latest';
    var latestRelease = await fetch(latestReleaseUrl, {mode: 'cors'}).then(response => response.json());
    var latestVersion = parseInt(latestRelease.tag_name.slice(1));
    
    console.log("AmazonBrandFilter: Latest brands list version is " + latestVersion);
    console.log("AmazonBrandFilter: Current brands list version is " + currentVersion);
    
    if (currentVersion != latestVersion){
        console.log("AmazonBrandFilter: Downloading latest brands list");
        try{
          // updateBrandList();
          updateBrandMap();
        }
        catch(err){
          console.error("AmazonBrandFilter: Error downloading brands list");
          return;
        }
        browser.storage.local.set({"brandsVersion": latestVersion});
    }
    
    console.log("AmazonBrandFilter: background.js sleeping for one day");
    await sleep(86400000);
  }
}

async function updateBrandList(){
  console.log("AmazonBrandFilter: Starting updateBrandList");

  var brandsUrl = "https://raw.githubusercontent.com/chris-mosley/AmazonBrandFilterList/main/brands.txt"

  try{
    var brandsGet = await fetch(brandsUrl, {mode: 'cors'})
      .then(response => response.text())
      .then(text => text.toUpperCase())
      .then(text => text.split("\n"))
  }
  catch(err){
    console.error("AmazonBrandFilter: Error downloading brands list");
    return;
  }

  browser.storage.local.set({"brandsCount": brandsGet.length});
  console.log("AmazonBrandFilter: Brands count is " + brandsGet.length);
  console.log("AmazonBrandFilter: Brands are " + brandsGet);
  
  browser.storage.local.set({"brandsList": brandsGet});
}

async function updateBrandMap(){
  console.log("AmazonBrandFilter: Starting updateBrandList");

  var brandsUrl = "https://raw.githubusercontent.com/chris-mosley/AmazonBrandFilterList/main/brands.txt"

  try{
    var brandsGet = await fetch(brandsUrl, {mode: 'cors'})
      .then(response => response.text())
      .then(text => text.toUpperCase())
      .then(text => text.split("\n"))
  }
  catch(err){
    console.error("AmazonBrandFilter: Error downloading brands list");
    return;
  }
  var brandsMap = {};
  for(var i=0; i <brandsGet.length; i++)
  {
    console.debug("AmazonBrandFilter: Adding " + brandsGet[i] + " to brands list");
      // protect against possible empty lines in the list
    if(brandsGet[i] != "")
      {
        brandsMap[brandsGet[i]] = true;
      }
  }
  
  
  console.log("AmazonBrandFilter: Brands count is " + brandsGet.length);
  
  
  
  browser.storage.local.set({"brandsMap": brandsMap});

  let keys = Object.keys(brandsMap);
  var maxWordCount = 0;
  for(var i=0; i < keys.length; i++){
    if(keys[i].split(" ").length > maxWordCount){
      maxWordCount = keys[i].split(" ").length;
    }
  }
  browser.storage.local.set({"maxWordCount": maxWordCount});
  console.log("AmazonBrandFilter: Max brand word count is " + maxWordCount);
  // console.log("AmazonBrandFilter: Brands are " + [...Object.keys(brandsMap)]);
  console.log("AmazonBrandFilter: Brands are " + keys);
  browser.storage.local.set({"brandsCount": keys.length});
  

}


// function createBrandMap(wordList, depth=0){
//   if(depth == wordList.length - 1){
//     return true;
//   }
//   var brandMap = {};
//   brandMap[wordList[depth+1]] = createBrandMap(wordList, depth + 1);
//   return brandMap;
// }

async function setIcon() {
  let enabled = await browser.storage.local.get("abf-enabled");
  if (enabled){
    browser.action.setIcon({
      path: {
        48: "icons/abf-enabled-128.png"
      }
    });
  } else {
    browser.action.setIcon({
      path: {
        48: "icons/abf-disabled-128.png"
      }
    });
  }
}

// set the default values for the extension
if(await getFirstRun() != false){
  console.log("AmazonBrandFilter: First run, setting defaults");
  browser.storage.local.set({"enabled": true});
  browser.storage.local.set({"brandsVersion": 0});
  browser.storage.local.set({"brandsCount": 0});
  browser.storage.local.set({"brandsMap": {}});
  browser.storage.local.set({"refinerBypass": true})
  browser.storage.local.set({"abfFirstRun": false});
}
else{
  console.log("AmazonBrandFilter: Not first run");
}

// set the icon the first time the extension is loaded
setIcon();
// Start checking for updates
checkBrandsVersion();
