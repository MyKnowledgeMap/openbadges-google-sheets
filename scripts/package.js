const fs = require("fs");
const archiver = require("archiver");
const name = "sheets";

// Fetch the manifest file.
const manifestFile = `./chrome/manifest.json`;
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

// The output package.
const package = `./dist/${name.toLowerCase()}.zip`;
// Create the output file.
const output = fs.createWriteStream(package);
const archive = archiver("zip", {
  zlib: { level: 9 } // Sets the compression level.
});
// Throw any errors, need to stop processing.
archive.on("error", function(err) {
  throw err;
});
// Pipe the archive to the output file.
archive.pipe(output);
// Add the entry file to the archive.
archive.append(fs.createReadStream(`./dist/${name}.js`), {
  name: "Code.gs"
});
// Add the chrome folder contents.
archive.directory(`./chrome/`, false);
// Finalize the archive.
archive.finalize();
console.log("Packaged successfully.");
