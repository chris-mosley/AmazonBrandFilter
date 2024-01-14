const fs = require("fs");
const path = require("path");

const rootPath = path.resolve("./");
const packageJson = require(`${rootPath}/package.json`);
const baseManifestJson = require(`${rootPath}/engines/common/manifest/base.json`);
const contentScriptsJson = require(`${rootPath}/engines/common/manifest/content-scripts.json`);
const manifestFilePath = path.resolve(__dirname, `${rootPath}/dist/manifest.json`);

try {
  // read the manifest file
  let manifest = JSON.parse(fs.readFileSync(manifestFilePath));

  // update the relevant keys
  manifest.version = packageJson.version;
  manifest.name = packageJson.name;
  manifest.description = packageJson.description;
  manifest = { ...manifest, ...baseManifestJson, ...contentScriptsJson };

  // write the updated manifest file
  fs.writeFileSync(manifestFilePath, JSON.stringify(manifest, null, 2));

  console.log(`Version updated to ${packageJson.version} in manifest.json.`);
} catch (error) {
  console.error(`Error updating manifest.json: ${error.message}`);
}
