const fs = require("fs");

const name = "sheets";
const userDefinedVersion = process.argv[2];

const manifestFile = `./chrome/${name.toLowerCase()}/manifest.json`;
const manifest = JSON.parse(fs.readFileSync(manifestFile));
const versions = manifest.version.split(".");
const latestVersion = new Number(versions.splice(2, 1));
versions.push(process.env.CIRCLE_BUILD_NUM);
manifest.version = versions.join(".");
fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2));
console.log(`Version updated to ${manifest.version}`);
