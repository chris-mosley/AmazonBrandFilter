# AmazonBrandFilter

## What is it?
### AmazonBrandFilter is a Firefox add-on that filters out all of the drop shipping brands that are randomly generated and clog up your search.

## How does it work?
### It uses an Allow List over here: https://github.com/chris-mosley/AmazonBrandFilterList
 - The allow list can be updated any time.  By default the add-on will update this list at initial startup and then once a day after that.

 README
======



# AmazonBrandFilter
This is the list that AmazonBrandFilter uses to filter with.

 **Table of content:**

 - [Why?](#iwhy)

 - [Missing a Brand?](#missing-brand)

 - [Submission Criteria](#submission-criteriax)

 


 <a id="why"></a>

 ### Why?



 

 <a id="missing-brand"></a>

 ### Missing a Brand?

There are two ways to go about this.

1. "I know how to do a Pull Request"

   -   Please submit a pull request just adding the missing brands to brands.txt folllowing the [Submission Criteria](#submission-criteria)

2.  "What is a Pull Request?"
    
    -  Please create a new issue [here](https://github.com/chris-mosley/AmazonBrandFilterList/issues) following the [Submission Criteria](#submission-criteria)
 

 <a id="submission-criteria"></a>

 ## Submission Criteria
 
### Which  Brands are allowed?
#### The main concern here is that this list is not a measure of "quality."  Generic brands, bad brands, evil brands.  The lot, they are all allowed on this list.  The only thing meant to be filtered out here are the dropshipping brands that sell random garbage. 
 If they have existed for more than a few years they likely belong on this list.
 
 A good (but not foolproof) rule of thumb is that if a brand has a dedicated website, it probably belongs on this list.
 
###  Pull Request Guidlines
#### Please:

- Alphabetize Brands
- Dedupe Brands
- Only newlines, no Carriage Returns
- Feel free to submit many brands in a single PR.  We might add a limit here if someone adds 100+ brands at a time but at the moment I feel its more important to flesh out the list.
- If a legitimate brand has multiple names for different product lines, please include them as different brands
