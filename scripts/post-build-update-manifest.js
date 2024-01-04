const fs = require('fs');
const path = require('path');

// read the version from package.json
const packageJson = require('../package.json');
const extensionVersion = packageJson.version;
const manifestFilePath = path.join(__dirname, `../dist/manifest.json`);

try {
  // read the manifest file
  const manifest = JSON.parse(fs.readFileSync(manifestFilePath));

  // update the version
  manifest.version = extensionVersion;

  // write the updated manifest file
  fs.writeFileSync(manifestFilePath, JSON.stringify(manifest, null, 2));

  console.log(`Version updated to ${extensionVersion} in manifest.json.`);
} catch (error) {
  console.error(`Error updating manifest.json: ${error.message}`);
}
