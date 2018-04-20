const fs = require("fs-extra");
const archive = require("archiver")("zip", { zlib: { level: 9 } });
const template = require("../package.json").manifest;

// The output package.
const package = `./dist/sheets.zip`;

// Throw any errors.
archive.on("error", (err) => {
  throw err;
});

// Pipe the archive to the output file.
archive.pipe(fs.createWriteStream(package));

// Generate the updated manifest file.
const manifest = (() => {
  let version;
  if (process.env.CIRCLE_BUILD_NUM) {
    version = process.env.CIRCLE_BUILD_NUM;
  } else {
    const current = Number(template.version);
    version = `${current + 1}`;
  }
  return JSON.stringify({ ...template, version }, null, 2);
})();
archive.append(manifest, { name: "manifest.json" });

// Add the entry file to the archive.
const code = fs.createReadStream(`./dist/sheets.js`);
archive.append(code, { name: "Code.gs" });
// Add empty background.js file.
archive.append("", { name: "background.js" });
// Add the assets folder contents.
archive.directory(`./assets/`, false);

// Finalize the archive.
archive.finalize();
fs.removeSync(`./dist/sheets.js`);
console.log("Packaged successfully.");
