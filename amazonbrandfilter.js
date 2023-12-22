console.log("AmazonBrandFilter: Starting amazonbrandfilter.js");


abfSettings=browser.storage.local.get().then(function(settings){
  console.log("AmazonBrandFilter: settings are: " + JSON.stringify(settings));
  

  
console.log("AmazonBrandFilter: abfSettings.enabled bool eval: " + settings.enabled);
if(settings.enabled){
  console.log("AmazonBrandFilter: abf is enabled");
  let previousUrl = '';
  let observer = new MutationObserver(function (mutations) {
      if (location.href !== previousUrl) {
          previousUrl = location.href;
          console.log(`URL data changed to ${location.href}`);
          sleep(1000).then(() => {
            const timerStart = performance.now();
            filterBrands(settings);
            //filterBrandsByList(settings);
            const timerEnd = performance.now();
            console.log(`AmazonBrandFilter: filterBrands took ${timerEnd - timerStart} milliseconds.`);
            browser.storage.local.set({lastMapRun: timerEnd - timerStart})
        });
      }
  });

  const config = {attributes: true, childList: true, subtree: true};
  observer.observe(document, config);
}
else{
  console.log("AmazonBrandFilter: abf is disabled");
}
});

async function getBrands(){
  console.log("attempting to get brands from storage");
  browser.storage.local.get("brandsList").then(function(result){
  console.log("AmazonBrandFilter: Brands are " + result);
    return result;
  });
}

function checkBrandFilter(){
  var boxesdiv=document.getElementById("brandsRefinements").children;

  for(let div of boxesdiv)
  {
    boxes=div.getElementsByTagName("input"); 
    if(boxes.length > 0){
      boxChecked=true;
      break;
    }
  }

  for(i=0; i < boxes.length; i++){
  
    if(boxes[i].checked){
      return "true";
    }
}
  return "false";

}

function getItemDivs(){
  console.log("AmazonBrandFilter: Starting getItemDivs");
  var divs = document.getElementsByClassName("s-result-item");
  
  return divs;
}

async function filterBrands(settings){
  synchedSettings = await browser.storage.sync.get();
  console.log("AmazonBrandFilter: synchedSettings are: " + JSON.stringify(synchedSettings));
  console.log("AmazonBrandFilter: Starting filterBrands");
  var brands = settings.brandsMap;
  // brandsGet.then(function(brands){
  console.log("AmazonBrandFilter: Brands are " + JSON.stringify(brands));
  if(brands.length != 0){
    console.log("AmazonBrandFilter: Brands found");
  }
  else{
    console.log("AmazonBrandFilter: No brands found");
    return;
  }
  
  console.log("AmazonBrandFilter: refinerBypass is " + settings.refinerBypass);
  if(settings.refinerBypass){
    if(checkBrandFilter() == "true"){
      console.log("AmazonBrandFilter: Brand filter is checked, not filtering")
      return;
    }
  }

  var divs = getItemDivs();
  console.log("AmazonBrandFilter: maxWordCount is " + settings.maxWordCount);
  for(var i = 0; i < divs.length; i++){

    itemHeader=divs[i].getElementsByClassName("s-line-clamp-1");
    if(itemHeader.length != 0){
      console.debug("AmazonBrandFilter: found itemHeader " + itemHeader[0].innerText);
      searchTerm=itemHeader[0].innerText.toUpperCase();
      if(settings.brandsMap[searchTerm]){
        console.log("AmazonBrandFilter: usePersonalBlock is: " + synchedSettings.usePersonalBlock);
        if(synchedSettings.usePersonalBlock == true){
          console.log("AmazonBrandFilter: personalBlockEnabled is true, checking personal block list");
          if(synchedSettings.personalBlockMap[searchTerm]){
            console.log("AmazonBrandFilter: Found " + searchTerm + " in personal block list");
            console.debug("AmazonBrandFilter: Hiding " + searchTerm);
            if(settings.debugMode){
              // to make it easier to tell when something is hidden because it isnt found vs when it is hidden because it is blocked
              divs[i].style.backgroundColor = "yellow";
              divs[i].innerHTML = "<span style='color: black; background-color: white;font-size: large;'>ABF DEBUG: " + searchTerm + "</span><br>"+ divs[i].innerHTML;
              continue;
            }
            else{
              divs[i].style.display = "none";
            }
            
          }
        }
        else {
          console.log("AmazonBrandFilter: Found " + searchTerm + " in brands list");
          if(settings.debugMode){
            divs[i].style.backgroundColor = "green";
            divs[i].innerHTML = "<span style='color: black; background-color: white;font-size: large;'>ABF DEBUG: " + searchTerm + "</span><br>"+ divs[i].innerHTML;
          }
          continue;
        }
      }
      else{
        console.debug("AmazonBrandFilter: Hiding " + searchTerm);
        if(settings.debugMode){
          divs[i].style.backgroundColor = "red";
        }
        else{
          divs[i].style.display = "none";
        }
        continue;
      }
    }

    shortText=divs[i].getElementsByClassName("a-color-base a-text-normal");
    if(shortText.length == 0){continue;}
    await descriptionSearch(settings,divs[i]);
  }

  if(settings.filterRefiner){
    console.log("AmazonBrandFilter: filterRefiner is true, filtering refiner");
    await filterRefiner(settings,synchedSettings);
  }

}

async function descriptionSearch(settings,div){
  shortText=div.getElementsByClassName("a-color-base a-text-normal");
  if(shortText.length == 0){return;}
  console.debug("AmazonBrandFilter: Checking " + div.innerText);
  let fullText=shortText[0].innerText.toUpperCase();
  console.log("AmazonBrandFilter: Full text is " + fullText);
  var wordList=fullText.replace(", "," ").split(" ").slice(0,8);
  console.log("AmazonBrandFilter: wordList is " + wordList);
  knownBrand=false;
  console.log("AmazonBrandFilter: maxWordCount is " + settings.maxWordCount)
  console.log("AmazonBrandFilter: wordList.length is " + wordList.length)
  for(let w = 0; w < settings.maxWordCount+3; w++)
  {
    
    for(let x = 0; x < wordList.length; x++)
    {
      let searchTerm=wordList.slice(x,w).join(" ");
      
      if(searchTerm.length == 0){continue;}
      console.log("AmazonBrandFilter: wordList slice is: (" + x + "," + w + "), wordlist.length is: " + wordList.length + " - " + JSON.stringify(wordList.slice(x,w)));
      console.debug("AmazonBrandFilter: searchTerm is: " + searchTerm);
      if(settings.brandsMap[searchTerm]){
        // check to see if each word is in the map.  if we dont stop then we hide it.
        console.log("AmazonBrandFilter: Found " + searchTerm + " in brands list");
        if(synchedSettings.usePersonalBlock){
          console.log("AmazonBrandFilter: personalBlockEnabled is true, checking personal block list");
          if(synchedSettings.personalBlockMap[searchTerm]){
            console.log("AmazonBrandFilter: Found " + searchTerm + " in personal block list");
            console.debug("AmazonBrandFilter: Hiding " + fullText);
            if(settings.debugMode){
              // to make it easier to tell when something is hidden because it isnt found vs when it is hidden because it is blocked
              div.style.backgroundColor = "yellow";
              div.innerHTML = "<span style='color: black; background-color: white;font-size: large;'>ABF DEBUG: " + searchTerm + "</span><br>"+ div.innerHTML;
            }
            else{
              div.style.display = "none";
            }
            return;
            
          }
        }
        if(settings.debugMode){
          div.style.backgroundColor = "green";
          div.innerHTML = "<span style='color: black; background-color: white;font-size: large;'>ABF DEBUG: " + searchTerm + "</span><br>"+ div.innerHTML;
        }
        return;
      }
    }
  }
    console.debug("AmazonBrandFilter: Hiding " + fullText);
    if(settings.debugMode){
      div.style.backgroundColor = "red";
    }
    else{
      div.style.display = "none";
    }
}

async function filterRefiner(settings,syncSettings){
  console.log("AmazonBrandFilter: Starting filterRefiner");
  refiner = document.getElementById("brandsRefinements");
  divs=refiner.getElementsByClassName("a-spacing-micro");

  console.log("AmazonBrandFilter: Refiner contains " + divs.length + " brands")
  for(var i = 0; i < divs.length; i++){
    console.debug("AmazonBrandFilter: Checking Refiner " + divs[i].className);

    let brand=divs[i].getElementsByClassName("a-size-base a-color-base")[0].innerText.toUpperCase();
    if(brand.length == 0){continue;}
    
    console.debug("AmazonBrandFilter: settings.brandsMap[" + brand +"] is: " + settings.brandsMap[brand]);
    if(!(settings.brandsMap[brand])){
      console.debug("AmazonBrandFilter: Hiding Refiner " + brand);
      if(settings.debugMode){
        divs[i].style.backgroundColor = "red";
      }
      else{
        if(settings.refinerMode == "grey"){
          divs[i].getElementsByClassName("a-size-base a-color-base")[0].setAttribute('style', 'color:grey !important');
        }
        else{
          divs[i].style.display = "none";
        }
      }
    }; 
    if(syncSettings.usePersonalBlock && syncSettings.personalBlockMap[brand]){
      console.debug("AmazonBrandFilter: Hiding Refiner " + brand);
      if(settings.debugMode){
        divs[i].style.backgroundColor = "yellow";
      }
      else{
        if(settings.refinerMode == "grey"){
          divs[i].getElementsByClassName("a-size-base a-color-base")[0].setAttribute('style', 'color:grey !important');
        }
        else{
          divs[i].style.display = "none";
        }
      }
    }
  }

}

function hideAllResults(){
  console.log("AmazonBrandFilter: Starting hideAllResults");
  var divs = getItemDivs();
  for(var i = 0; i < divs.length; i++){
    divs[i].style.display = "none";
  }
}

async function getSettings(type){
  if(type == "sync"){
    settings = await browser.storage.sync.get();
  }
  else{
    settings = await browser.storage.local.get();
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}