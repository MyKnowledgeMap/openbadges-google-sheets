const fs = require("fs");

const name = "sheets";

// Fetch the manifest file.
const manifestFile = `./chrome/${name.toLowerCase()}/manifest.json`;
const manifest = JSON.parse(fs.readFileSync(manifestFile));

// Split the current version string "x.x.x"
const versions = manifest.version.split(".");

// Remove the latest version of the patch value.
const latestVersion = new Number(versions.splice(2, 1));

// Add the new patch value.
versions.push(process.env.CIRCLE_BUILD_NUM || latestVersion + 1);

// Build the version string.
manifest.version = versions.join(".");

// Write the updated manifest back to the file.
fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2));

console.log(`Version updated to ${manifest.version}`);
