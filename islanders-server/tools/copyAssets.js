"use strict";
exports.__esModule = true;
var shell = require("shelljs");
// Remove all the view templates
shell.rm('-rf', "dist/public/**/*");
// Copy all the view templates
shell.cp("-R", "public", "dist/");
