export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const getItemDivs = (): HTMLCollectionOf<HTMLDivElement> => {
  console.log("AmazonBrandFilter: Starting getItemDivs");
  const divs = document.getElementsByClassName("s-result-item");
  return divs as HTMLCollectionOf<HTMLDivElement>;
};

export const unHideDivs = () => {
  console.log("AmazonBrandFilter: Starting unHideDivs");
  const divs = getItemDivs();
  for (let i = 0; i < divs.length; i++) {
    divs[i].style.display = "block";
  }
};
