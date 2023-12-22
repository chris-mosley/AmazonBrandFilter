# AmazonBrandFilter

**Table of content:**

- [What is it?](#what)

- [How does it work?](#how)
- [Why?](#why)
- [Missing a Brand?](#missing-brand)
- [What's Coming?](#upcoming)

## What is it?

### AmazonBrandFilter is a Firefox add-on that filters out all of the drop shipping brands that are randomly generated and clog up your search.

## How does it work?

### It uses an Allow List over here: https://github.com/chris-mosley/AmazonBrandFilterList

The allow list can be updated any time. By default the add-on will update this list at initial startup and then once a day after that.

### Why not a block list instead of an allow list?

Because while it will certainly be a challenge and a very _very_ long road, an allow list has a hypothetical end while a block list would be impossible to "complete." They will generate brands faster than we could ever update a block list.

### Why?

Because we're all sick of crappy fake brands clogging up our search!

### Missing a Brand?

Please refer to the Submission Criteria in the AmazonBrandFilterList repo here: https://github.com/chris-mosley/AmazonBrandFilterList#submission-criteria

### Which Brands are allowed?

#### The main concern here is that this list is not a measure of "quality." Generic brands, bad brands, evil brands. The lot, they are all allowed on this list. The only thing meant to be filtered out here are the drop-shipping brands that sell random garbage.

If they have existed for more than a few years they likely belong on this list.

A good (but not foolproof) rule of thumb is that if a brand has a dedicated website, it probably belongs on this list.

### Roadmap

In no particular order these are the things I would like to add eventually

- Per department disabling of the filter
- Caret or something on the page to indicate that things have been hidden
- A way for users to report a missing brand from within the add-on popup
- A personal list of brands to filter (say you hate a "real" brand for ethical reasons or otherwise) and to allow to bypass (this is probably for a brand that just hasn't been added yet)
- Localization: A big one I wasn't expecting to need. Sorry to all you guys outside the US that are trying the addon and finding it does not work. I am adding permissions for different Amazon top-level domains based on where I see people downloading the addon from.
- Along with localiztion I'm considering having different lists based on locale. I'm not sure it will be necessary yet.
