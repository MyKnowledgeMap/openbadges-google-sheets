const fs = require("fs");
const archiver = require("archiver");
const name = "sheets";

// Fetch the manifest file.
const manifestFile = `./chrome/manifest.json`;
const manifest = JSON.parse(fs.readFileSync(manifestFile));
// Get the latest version as a number.
const latestVersion = new Number(manifest.version);
//Get the new version numberr.
const newVersion = process.env.CIRCLE_BUILD_NUM || latestVersion + 1;
// Build the version string.
manifest.version = newVersion.toString();
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
