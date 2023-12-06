


async function checkBrandsVersion(){
  while(true){
    console.log("AmazonBrandFilter: Checking latest brands list version");
    var currentVersion = await getCurrentBrandsVersion();
    var versionUrl = 'https://raw.githubusercontent.com/chris-mosley/AmazonBrandFilterList/main/version.txt'
    var latestVersion = await fetch(versionUrl, {mode: 'cors'})
      .then(response => response.text())
      .then(text => parseInt(text))
    
      console.log("AmazonBrandFilter: Latest brands list version is " + latestVersion);
      console.log("AmazonBrandFilter: Current brands list version is " + currentVersion);
    if(currentVersion <= latestVersion || currentVersion == undefined){
      
        console.log("AmazonBrandFilter: Downloading latest brands list");
        downloadLatestBrands()
        browser.storage.local.set({"brandsVersion": latestVersion});
      }
    
      console.log("AmazonBrandFilter: backgroup.js sleeping for 30 seconds");
    await sleep(30000);
  }
}



async function downloadLatestBrands(){
  console.log("AmazonBrandFilter: Starting downloadLatestBrands");

  var brandsUrl = 'https://raw.githubusercontent.com/chris-mosley/AmazonBrandFilterList/main/brands.txt'
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

    var versionInt = parseInt(result.brandsVersion);
    console.log("AmazonBrandFilter: intifyingValue is:  " + versionInt);


    return versionInt})
  }



function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


// downloadLatestBrands();
checkBrandsVersion();