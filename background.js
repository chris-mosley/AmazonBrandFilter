function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getCurrentBrandsVersion(){
  let result = await browser.storage.local.get("brandsVersion");
  console.log("AmazonBrandFilter: Current brands version is " + result.brandsVersion);
  return result.brandsVersion
}

async function checkBrandsVersion(){
  while (true) {
    console.log("AmazonBrandFilter: Checking latest brands list version");
    
    var currentVersion = await getCurrentBrandsVersion();
    var latestReleaseUrl = 'https://api.github.com/repos/chris-mosley/AmazonBrandFilterList/releases/latest';
    var latestRelease = await fetch(latestReleaseUrl, {mode: 'cors'}).then(response => response.json());
    var latestVersion = parseInt(latestRelease.tag_name.slice(1));
    
    console.log("AmazonBrandFilter: Latest brands list version is " + latestVersion);
    console.log("AmazonBrandFilter: Current brands list version is " + currentVersion);
    
    if (currentVersion != latestVersion){
        console.log("AmazonBrandFilter: Downloading latest brands list");
        try{
          updateBrandList();
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
    console.log("AmazonBrandFilter: Adding " + brandsGet[i] + " to brands list");
    
    // WIP here.
    // if(brandsGet[i].includes(" ")){
    //   wordList = brandsGet[i].split(" ");
    //   brandMap = createBrandMap(wordList, 0);
    //   // console.log("AmazonBrandFilter: Brand map is " + JSON.stringify(brandMap));
    //   console.log("word is " + wordList[0] + " and brand map is " + JSON.stringify(brandMap));
    //   brandsMap[wordList[0]] = brandMap;
    // } 
    // else{
    //   brandsMap[brandsGet[i]] = true;
    // }
    brandsMap[brandsGet[i]] = true;
  }
  browser.storage.local.set({"brandsCount": Object.keys(brandsMap).length});
  console.log("AmazonBrandFilter: Brands count is " + brandsGet.length);
  console.log("AmazonBrandFilter: Brands are " + [...Object.keys(brandsMap)]);
  
  browser.storage.local.set({"brandsMap": brandsMap});
}

function createBrandMap(wordList, depth=0){
  if(depth == wordList.length - 1){
    return true;
  }
  var brandMap = {};
  brandMap[wordList[depth+1]] = createBrandMap(wordList, depth + 1);
  return brandMap;
}

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

// set the icon the first time the extension is loaded
setIcon();
// Start checking for updates
checkBrandsVersion();
