
console.log("AmazonBrandFilter: Starting popup.js");



setPopupBoxStates();
setAddonVersion()

// document.getElementById("abf-enabled").checked = true

document.getElementById("abf-enabled").addEventListener("click", enableDisable)
document.getElementById("abf-filter-refiner").addEventListener("click", setFilterRefiner)
document.getElementById("abf-allow-refine-bypass").addEventListener("click", setRefinerBypass)
document.getElementById("abf-debug-mode").addEventListener("click", setDebugMode)
// document.getElementById("abf-hideall").addEventListener("click", hideAll)


function clickTest(event){
  {
    console.log("AmazonBrandFilter: Starting " + event.target.id);
    testDiv = document.getElementById("text");
    testDiv.innerHTML = "Clicked";
  }
}

function setPopupBoxStates(){
  console.log("AmazonBrandFilter: Setting Popup Box States")
  browser.storage.local.get().then(function(settings){
  
    console.log("AmazonBrandFilter: abfSettings is " + JSON.stringify(settings));
    if(settings.enabled){
      console.log("AmazonBrandFilter: abfSettings.enabled is enabled");
        document.getElementById("abf-enabled").checked = true;
      }
    else{
      console.log("AmazonBrandFilter: abfSettings is not enabled");
      document.getElementById("abf-enabled").checked = false;
    }

    if(settings.filterRefiner){
      console.log("AmazonBrandFilter: abfSettings.filterRefiner is enabled");
      document.getElementById("abf-filter-refiner").checked = true;
    }
    else{
      console.log("AmazonBrandFilter: abfSettings.filterRefiner is not enabled");
      document.getElementById("abf-filter-refiner").checked = false;
    }
    
    if(settings.refinerBypass){
      console.log("AmazonBrandFilter: abfSettings.filterRefiner is enabled");
      document.getElementById("abf-allow-refine-bypass").checked = true;
    }
    else{
      console.log("AmazonBrandFilter: abfSettings.filterRefiner is not enabled");
      document.getElementById("abf-allow-refine-bypass").checked = false;
    }
    setIcon();
    document.getElementById("version-number").innerText = settings.brandsVersion;
    document.getElementById("brand-count").innerText = settings.brandsCount;
    if(settings.lastMapRun != null){
      document.getElementById("last-run").innerText = settings.lastMapRun + "ms";
    }
    else{
        document.getElementById("last-run").innerText = "N/A";
    }

    if(settings.debugMode){
      console.log("AmazonBrandFilter: abfSettings.debugMode is enabled");
      document.getElementById("abf-debug-mode").checked = true;
    }

  });
  };
  
  async function setAddonVersion(){
    var manifest = browser.runtime.getManifest();
    document.getElementById("abf-version").innerText="v" + manifest.version;
  }
  
  async function setIcon(){
    await browser.storage.local.get("enabled").then(function(result){
      console.log("AmazonBrandFilter: abfSettings.enabled bool eval: " + JSON.stringify(result.enabled));
      if(result.enabled == true){
        console.log("AmazonBrandFilter: setting icon to enabled");
      browser.action.setIcon({
        path: {
          48: "../icons/abf-enabled-128.png"
        }
      });
      }
      else{
        console.log("AmazonBrandFilter: setting icon to disabled");
        browser.action.setIcon({
          path: {
            48: "../icons/abf-disabled-128.png"
          }
        });
      }
  });
  }
  

async function enableDisable(event){
  enabled=document.getElementById("abf-enabled").checked;
  console.log("event: "+ event);
  if(enabled){
    browser.storage.local.set({"enabled": true});
  }
  else{
    tab = await getCurrentTab();
    console.log(tab);
    browser.storage.local.set({"enabled": false});
  }
  
  browser.storage.local.get("enabled").then(function(result){
    console.log("enabled: " + result.enabled);
  });
  setIcon();
}

async function setFilterRefiner(event){
  enabled=document.getElementById("abf-filter-refiner").checked;
  console.log("event: "+ event);
  if(enabled){
    browser.storage.local.set({"filterRefiner": true});
  }
  else{
    browser.storage.local.set({"filterRefiner": false});
  }
  
  browser.storage.local.get("filterRefiner").then(function(result){
    console.log("filterRefiner: " + result.filterRefiner);
  });
}

async function setRefinerBypass(event){
  enabled=document.getElementById("abf-allow-refine-bypass").checked;
  console.log("event: "+ event);
  if(enabled){
    browser.storage.local.set({"refinerBypass": true});
  }
  else{
    browser.storage.local.set({"refinerBypass": false});
  }
  
  browser.storage.local.get("refinerBypass").then(function(result){
    console.log("refinerBypass: " + result.refinerBypass);
  });
}

async function setDebugMode(event){
  enabled=document.getElementById("abf-debug-mode").checked;
  console.log("event: "+ event);
  if(enabled){
    browser.storage.local.set({"debugMode": true});
  }
  else{
    browser.storage.local.set({"debugMode": false});
  }
  
  browser.storage.local.get("debugMode").then(function(result){
    console.log("debugMode: " + result.debugMode);
  });
}



function unHideDivs(){
  var divs = document.getElementsByClassName("s-result-item");
  for(let div of divs){
    div.style.display = "block";
  }
}


async function logCurrentTab(){
  tab = await getCurrentTab();
  console.log(tab);
}

async function getCurrentTab() {
  console.log("AmazonBrandFilter: Starting getCurrentTab");
  tab= browser.tabs.query({ currentWindow: true, active: true });
  return tab;
}

function addBorder(){
  document.border = "5px solid red";
}

function addBorderToTab(){
  tab=getCurrentTab().then(tab => {;
  console.log("tab is: " + tab[0].id)
  browser.scripting.executeScript({
      func: filterBrands(),
      files: ["amazonbrandfilter.js"],
      injectImmediately: true,
      target: {tabId: tab[0].id}
  });})
}


function hideAll(){
  console.log("AmazonBrandFilter: Starting hideAll");
  tab=getCurrentTab().then(tab => {
  console.log("tab is: " + tab[0].id)
  browser.scripting.executeScript({
      func: hideAllResults(),
      files: ["../amazonbrandfilter.js"],
      injectImmediately: true,
      target: {tabId: tab[0].id}
  });})
}

