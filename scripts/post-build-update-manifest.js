const fs = require("fs");
const path = require("path");

const rootPath = path.resolve("./");
const packageJson = require(`${rootPath}/package.json`);
const manifestFilePath = path.resolve(__dirname, `${rootPath}/dist/manifest.json`);

let commonManifestJson = require(`${rootPath}/engines/common/manifest.json`);
let commonMatchesJson = require(`${rootPath}/engines/common/matches.json`);
let commonWebAccessibleResourcesJson = require(`${rootPath}/engines/common/web-accessible-resources.json`);

try {
  // read the manifest file
  // the base file from whichever engine is being built will exist before this script runs
  let manifest = JSON.parse(fs.readFileSync(manifestFilePath));

  // update the matches in the web_accessible_resources json
  commonWebAccessibleResourcesJson = {
    ...commonWebAccessibleResourcesJson,
    matches: commonMatchesJson,
  };

  // set the content_scripts and set the matches
  commonManifestJson = {
    ...commonManifestJson,
    content_scripts: [
      {
        matches: commonMatchesJson,
        js: ["content.js"],
      },
    ],
  };

  // take required keys from package.json
  // manifest web_accessible_resources needs to be updated at this point
  // also include the common manifest json
  manifest = {
    ...manifest,
    version: packageJson.version,
    description: packageJson.description,
    web_accessible_resources: [...manifest.web_accessible_resources, commonWebAccessibleResourcesJson],
    ...commonManifestJson,
  };

  // write the updated manifest file
  fs.writeFileSync(manifestFilePath, JSON.stringify(manifest, null, 2));
  console.log(`Version updated to ${packageJson.version} in manifest.json.`);

  // move the analyzer report.html out of the dist folder if it exists
  if (fs.existsSync(`${rootPath}/dist/report.html`)) {
    fs.renameSync(`${rootPath}/dist/report.html`, `${rootPath}/report.html`);
    console.log(`Moved 'report.html' to ${rootPath}`);
  }
} catch (error) {
  console.error(`Error updating manifest.json: ${error.message}`);
}
