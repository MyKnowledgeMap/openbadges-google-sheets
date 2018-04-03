const fs = require("fs");
const archiver = require("archiver");

const name = "sheets";

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
archive.directory(`./chrome/${name.toLowerCase()}/`, false);

// Finalize the archive.
archive.finalize();

console.log("Packaged successfully.");
