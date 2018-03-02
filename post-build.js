const fs = require('fs-extra');
fs.copySync("./src/templates/auth.email.html", "./dist/auth.email.html")
fs.copySync("./src/templates/auth.modal.html", "./dist/auth.modal.html")
fs.copySync("./src/templates/settings.sidebar.html", "./dist/settings.sidebar.html");