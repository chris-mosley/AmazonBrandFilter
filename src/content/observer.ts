import { runFilter } from "content/filter";

export const startObserver = async () => {
  console.log("AmazonBrandFilter: Starting observer!");
  const observer = new MutationObserver(async (mutations) => {
    // check if the mutation is invalid
    let mutationInvalid = false;
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      mutationInvalid = Array.from(mutation.addedNodes).some(
        (node) =>
          // check if the node is a carousel card class (these are the revolving ads)
          (node as HTMLElement).classList?.contains("a-carousel-card") ||
          // check if the node contains the text "ends in" (lowercase)
          (node.nodeType === 3 && (node as Text).textContent?.toLowerCase().includes("ends in"))
      );
    }

    if (mutationInvalid) {
      return;
    }

    console.log("AmazonBrandFilter: Mutation detected!");
    runFilter();
  });
  observer.observe(document, {
    subtree: true,
    childList: true,
  });
};
