
console.log("AmazonBrandFilter: Starting popup.js");



setPopupBoxStates();
setTextBoxStates();
setAddonVersion()
setPersonalList()
// document.getElementById("abf-enabled").checked = true

document.getElementById("abf-enabled").addEventListener("click", enableDisable)
document.getElementById("abf-filter-refiner").addEventListener("click", setFilterRefiner)
document.getElementById("abf-filter-refiner-hide").addEventListener("click", setRefinerHide)
document.getElementById("abf-filter-refiner-grey").addEventListener("click", setRefinerGrey)
document.getElementById("abf-allow-refine-bypass").addEventListener("click", setRefinerBypass)
document.getElementById("abf-debug-mode").addEventListener("click", setDebugMode)
document.getElementById("abf-personal-block-enabled").addEventListener("click", setPersonalBlockEnabled)
document.getElementById("abf-personal-block-button").addEventListener("click", savePersonalBlock)


// document.getElementById("abf-hideall").addEventListener("click", hideAll)


function clickTest(event){
  {
    console.log("AmazonBrandFilter: Starting " + event.target.id);
    testDiv = document.getElementById("text");
    testDiv.innerHTML = "Clicked";
  }
}

async function setPopupBoxStates(){
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

    if(settings.refinerMode == "grey"){
      console.log("AmazonBrandFilter: abfSettings.refinerMode is grey");
      document.getElementById("abf-filter-refiner-grey").checked = true;
      document.getElementById("abf-filter-refiner-hide").checked = false;
    }
    else{
      console.log("AmazonBrandFilter: abfSettings.refinerMode is hide");
      document.getElementById("abf-filter-refiner-hide").checked = true;
      document.getElementById("abf-filter-refiner-grey").checked = false;
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
  
async function setTextBoxStates(){
  syncSettings = await browser.storage.sync.get();
  if(syncSettings.usePersonalBlock == true){
    console.log("AmazonBrandFilter: usePersonalBlock is true");
    document.getElementById("abf-personal-block-enabled").checked = true;
    document.getElementById('abf-personal-block-text').style.display = "block";
    document.getElementById('abf-personal-block-button').style.display = "block";
  }
}


async function enableDisable(event){
  enabled=document.getElementById("abf-enabled").checked;
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

async function setRefinerHide(event){
  enabled=document.getElementById("abf-filter-refiner-hide").checked;
  if(enabled){
    browser.storage.local.set({"refinerMode": "hide"});
    document.getElementById("abf-filter-refiner-grey").checked = false;
  }
  else{
    browser.storage.local.set({"refinerMode": "grey"});
  }
  
  browser.storage.local.get("refinerMode").then(function(result){
    console.log("refinerMode: " + result.refinerMode);
  });
}

async function setRefinerGrey(event){
  enabled=document.getElementById("abf-filter-refiner-grey").checked;
  if(enabled){
    browser.storage.local.set({"refinerMode": "grey"});
    document.getElementById("abf-filter-refiner-hide").checked = false;
  }
  else{
    browser.storage.local.set({"refinerMode": "hide"});
  }
  
  browser.storage.local.get("refinerMode").then(function(result){
    console.log("refinerMode: " + result.refinerMode);
  });
}


async function setRefinerBypass(event){
  enabled=document.getElementById("abf-allow-refine-bypass").checked;
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

async function savePersonalBlock(){
  
  userInput = await getSanitizedUserInput()
  personalBlockMap= new Map();
  for(let brand of userInput){
    console.log("AmazonBrandFilter: adding brand: " + brand)
    personalBlockMap[brand] = true;
  }
  console.log("AmazonBrandFilter: personalBlockMap is: " + JSON.stringify(personalBlockMap));
  browser.storage.sync.set({"personalBlockMap": personalBlockMap});
  document.getElementById('abf-personal-block-saved-confirm').style.display = "block";
}

async function setPersonalList(){
  
  personalBlockMap = await browser.storage.sync.get("personalBlockMap");
  personalBlockMap = personalBlockMap.personalBlockMap;

  if(personalBlockMap == undefined){
    console.log("AmazonBrandFilter: personalBrandsMap is undefined");
    return;
  }
  console.log("AmazonBrandFilter: personalBrandsMap is: " + JSON.stringify(personalBlockMap));
    if(personalBlockMap == undefined){
      return;
    }
    
    console.log("personalBlockMap keys are: "+ Object.keys(personalBlockMap));
    textValue = Object.keys(personalBlockMap);
    textHeight = Object.keys(personalBlockMap).length;
    if(textHeight > 10){
      textHeight = 10;
      document.getElementById('abf-personal-block-text').style.overflow = "scroll";
    }
      
    
    textValue = textValue.join("\n");
    console.log("AmazonBrandFilter: setting personal block list text area to: " + textValue);
    document.getElementById('abf-personal-block-text').value = textValue;
    document.getElementById('abf-personal-block-text').rows = textHeight;
  
}

async function getSanitizedUserInput(){
  // god so much santization to do here
  let userInput= await document.getElementById('abf-personal-block-text').value.split("\n");
  console.log(userInput);
  sanitizedInput=[];
  for(line of userInput){
    // we'll come up with something smarter later.
    if(line == "" || line == " " || line == "\n" || line == "\r\n" || line == "\r"){
      continue;
    }
    sanitizedInput.push(line.toUpperCase());
  }
  return sanitizedInput;
}

async function setPersonalBlockEnabled(){
  enabled=document.getElementById("abf-personal-block-enabled").checked;
  if(enabled){
    browser.storage.sync.set({"usePersonalBlock": true});
    document.getElementById('abf-personal-block-text').style.display = "block";
    document.getElementById('abf-personal-block-button').style.display = "block";
  }
  else{
    browser.storage.sync.set({"usePersonalBlock": false});
    document.getElementById('abf-personal-block-text').style.display = "none";
    document.getElementById('abf-personal-block-button').style.display = "none";
  }
  
  browser.storage.sync.get("usePersonalBlock").then(function(result){
    console.log("personalBlockEnabled: " + result.usePersonalBlock);
  });
}

async function getSettings(location){
  if(location == "sync"){
    settings = await browser.storage.sync.get().then(function(result){
      console.log("AmazonBrandFilter: sync settings are: " + JSON.stringify(result));
    });
  }
  else{
    settings = await browser.storage.local.get().then(function(result){
      console.log("AmazonBrandFilter: local settings are: " + JSON.stringify(result));
    });
  }
  return settings;
}

function textAreaAdjust(element) {
  element.style.height = "1px";
  element.style.height = (25+element.scrollHeight)+"px";
}