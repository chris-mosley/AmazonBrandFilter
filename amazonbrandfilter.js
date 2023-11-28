console.log("AmazonBrandFilter: Starting content.js");
document.body.style.border = "5px solid red";

async function getBrands(){
  // gets the brands url from the extension browser store.
  brands=[];
  brandsUrl = browser.runtime.getURL("brands.txt");
  // brandsUrl = 'https://raw.githubusercontent.com/chris-mosley/AmazonBrandFilterList/latest/brands.txt'
  console.log("AmazonBrandFilter: Brands url is " + brandsUrl);
  brandsGet = await fetch(brandsUrl, {mode: 'no-cors'})
    .then(response => response.text())
    .then(text => text.toUpperCase())
    .then(text => text.split("\n"))
    
  return brandsGet;
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

function filterBrands(){
  console.log("AmazonBrandFilter: Starting filterBrands");
  brandsGet = getBrands();
  brandsGet.then(function(brands){
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
  
  if(checkBrandFilter() == "true"){
    console.log("AmazonBrandFilter: Brand filter is checked, not filtering")
    return;
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
  
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


let previousUrl = '';
let observer = new MutationObserver(function (mutations) {
    if (location.href !== previousUrl) {
        previousUrl = location.href;
        // console.log(`URL data changed to ${location.href}`);
        // your code here
        
        sleep(1000).then(() => {
        filterBrands();
      });
    }
});

const config = {attributes: true, childList: true, subtree: true};
observer.observe(document, config);