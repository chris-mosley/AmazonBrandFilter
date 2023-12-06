console.log("AmazonBrandFilter: Starting amazonbrandfilter.js");


abfSettings=browser.storage.local.get().then(function(settings){
  console.log("AmazonBrandFilter: settings are: " + JSON.stringify(settings));
  


console.log("AmazonBrandFilter: abfSettings.enabled bool eval: " + settings);
if(settings.enabled){
  console.log("AmazonBrandFilter: abf is enabled");
  let previousUrl = '';
  let observer = new MutationObserver(function (mutations) {
      if (location.href !== previousUrl) {
          previousUrl = location.href;
          console.log(`URL data changed to ${location.href}`);
          sleep(1000).then(() => {
          filterBrands(settings);
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
  // gets the brands url from the extension browser store.
  // brands=[];
  // brandsUrl = browser.runtime.getURL("brands.txt");
  // // brandsUrl = 'https://raw.githubusercontent.com/chris-mosley/AmazonBrandFilterList/latest/brands.txt'
  // console.log("AmazonBrandFilter: Brands url is " + brandsUrl);
  // brandsGet = await fetch(brandsUrl, {mode: 'no-cors'})
  //   .then(response => response.text())
  //   .then(text => text.toUpperCase())
  //   .then(text => text.split("\n"))
    
  console.log("attempting to get brands from storage");
  browser.storage.local.get("brandsList").then(function(result){
  console.log("AmazonBrandFilter: Brands are " + result.brandsList);
    return result.brandsList;
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

function filterBrands(settings){
  console.log("AmazonBrandFilter: Starting filterBrands");
  brands = settings.brandsList;
  // brandsGet.then(function(brands){
  console.log("AmazonBrandFilter: Brands are " + brands);
  if(brands.length != 0){
    console.log("AmazonBrandFilter: Brands found");
    brands.forEach(function(brand){
      console.debug(brand);
    });
    var maxLength= Math.max(...(brands.map(el => el.length)));
    // doing this to hopefully filter out listings that add a bunch of random name brands to the title at the end, might improve performance too 
    console.log("AmazonBrandFilter: Max length of brand is " + maxLength)
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

  for(var i = 0; i < divs.length; i++){
    console.debug("AmazonBrandFilter: Checking " + divs[i].className);

    shortText=divs[i].getElementsByClassName("a-color-base a-text-normal")
    
    if(shortText.length == 0){continue;}
    
    fullText=shortText[0].innerText.toUpperCase().slice(0, maxLength);
    // fullText=shortText[0].innerText.toUpperCase();
    if(!(brands.some(filter => fullText.includes(filter)))){
      console.debug("AmazonBrandFilter: Hiding " + fullText);
      divs[i].style.display = "none";
    };  
  }

  if(settings.filterRefiner){
    console.log("AmazonBrandFilter: filterRefiner is true, filtering refiner");
    filterRefiner(brands);
  }
  


  // });
}

function filterRefiner(brands){
  console.log("AmazonBrandFilter: Starting filterRefiner");
  refiner = document.getElementById("brandsRefinements");
  divs=refiner.getElementsByClassName("a-spacing-micro");
  for(var i = 0; i < divs.length; i++){
    console.debug("AmazonBrandFilter: Checking Refiner " + divs[i].className);

    brand=divs[i].getElementsByClassName("a-size-base a-color-base")[0].innerText.toUpperCase();
    if(brand.length == 0){continue;}
    
    
    if(!(brands.includes(brand))){
      console.debug("AmazonBrandFilter: Hiding Refiner" + fullText);
      divs[i].style.display = "none";
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

