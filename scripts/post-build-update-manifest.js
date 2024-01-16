const fs = require("fs");
const path = require("path");

const rootPath = path.resolve("./");
const packageJson = require(`${rootPath}/package.json`);
const commonManifestJson = require(`${rootPath}/engines/common/manifest.json`);
const manifestFilePath = path.resolve(__dirname, `${rootPath}/dist/manifest.json`);

try {
  // read the manifest file
  let manifest = JSON.parse(fs.readFileSync(manifestFilePath));

  // update the relevant keys
  manifest.version = packageJson.version;
  manifest.description = packageJson.description;
  manifest = { ...manifest, ...commonManifestJson };

  // write the updated manifest file
  fs.writeFileSync(manifestFilePath, JSON.stringify(manifest, null, 2));

  console.log(`Version updated to ${packageJson.version} in manifest.json.`);
} catch (error) {
  console.error(`Error updating manifest.json: ${error.message}`);
}
