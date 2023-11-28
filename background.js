
console.log("AmazonBrandFilter: Loading background.js");
function handleClick() {
  console.log("AmazonBrandFilter: Clicked the button");
  document.body.style.border = "5px solid blue";
}


console.log("AmazonBrandFilter: Starting background.js")
if(!(browser.browserAction.onClicked.hasListener(handleClick))){
  console.log("AmazonBrandFilter: Adding listener");
  browser.browserAction.onClicked.addListener(handleClick);
}



addEventListener("popstate", (event) => {
  console.log("AmazonBrandFilter: popstate event");
});
