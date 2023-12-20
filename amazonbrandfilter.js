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
  console.log("AmazonBrandFilter: Starting filterBrands");
  var brands = settings.brandsMap;
  // brandsGet.then(function(brands){
  console.log("AmazonBrandFilter: Brands are " + brands);
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
      searchTerm=itemHeader[0].innerText.toUpperCase();
      if(settings.brandsMap[searchTerm]){
        // check to see if each word is in the map.  if we dont stop then we hide it.
        console.log("AmazonBrandFilter: Found " + " in brands list");
        if(settings.debugMode){
          divs[i].style.backgroundColor = "green";
          divs[i].innerHTML = "<span style='color: black; background-color: white;font-size: large;'>ABF DEBUG: " + searchTerm + "</span><br>"+ divs[i].innerHTML;
        }
        continue;
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
    console.debug("AmazonBrandFilter: Checking " + divs[i].innerText);
    fullText=shortText[0].innerText.toUpperCase();
    console.log("AmazonBrandFilter: Full text is " + fullText);
    

    
    let searchResult=await descriptionSearch(settings,fullText);
    console.log("AmazonBrandFilter: knownBrand is " + knownBrand)
    
    if(searchResult != null){
      if(settings.debugMode){
        divs[i].style.backgroundColor = "green";
        divs[i].innerHTML = "<span style='color: black; background-color: white;font-size: large;'>ABF DEBUG: " + searchTerm + "</span><br>"+ divs[i].innerHTML;
      }
    }
    else{
      console.debug("AmazonBrandFilter: Hiding " + fullText);
      if(settings.debugMode){
        divs[i].style.backgroundColor = "red";
      }
      else{
        divs[i].style.display = "none";
      }
    }
    
    
  }

  if(settings.filterRefiner){
    console.log("AmazonBrandFilter: filterRefiner is true, filtering refiner");
    await filterRefiner(brands, settings);
  }

}

async function descriptionSearch(settings,text){
  knownBrand=false;
  wordList=text.split(" ").slice(0,8); // we still need to deal with commas/punctuation here.
  for(let w = 0; w < settings.maxWordCount; w++)
  {
    for(let x =0; x < wordList.length; x++)
    {
      let searchTerm=wordList.slice(x,w).join(" ");
      console.debug("AmazonBrandFilter: searchTerm is: " + searchTerm);
      if(settings.brandsMap[searchTerm]){
        // check to see if each word is in the map.  if we dont stop then we hide it.
        console.log("AmazonBrandFilter: Found " + searchTerm + " in brands list");
        return searchTerm;
      }
    }
  }
    return null;
}

async function filterRefiner(brands, settings){
  console.log("AmazonBrandFilter: Starting filterRefiner");
  refiner = document.getElementById("brandsRefinements");
  divs=refiner.getElementsByClassName("a-spacing-micro");
  for(var i = 0; i < divs.length; i++){
    console.debug("AmazonBrandFilter: Checking Refiner " + divs[i].className);

    brand=divs[i].getElementsByClassName("a-size-base a-color-base")[0].innerText.toUpperCase();
    if(brand.length == 0){continue;}
    
    
    if(!(brands[brand])){
      console.debug("AmazonBrandFilter: Hiding Refiner " + fullText);
      if(settings.debugMode){
        divs[i].style.backgroundColor = "red";
      }
      else{
        divs[i].style.display = "none";
      }
    };  
  }

}

function hideAllResults(){
  console.log("AmazonBrandFilter: Starting hideAllResults");
  var divs = getItemDivs();
  for(var i = 0; i < divs.length; i++){
    divs[i].style.display = "none";
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}