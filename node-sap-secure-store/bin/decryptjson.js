#!/usr/bin/env node
var helper = require("./helper.js");
var secureStore = require("../index.js");

var usage = "\nUsage: decryptjson [-p <password>] [-e <environment-variable>] filename | -h\n\nDecrypts a JSON configuration file ('cryptjson -h' displays this help).\n\n";
usage += "  -p <password> specifies that file will be decrypted using password '<password>'\n";
usage += "  -e <environment-variable> specifies that file will be decrypted using the password stored in the environment variable <environment-variable>\n";
usage += "  filename path of the JSON file to decrypt\n\n";
usage += "If neither -p nor -e options are used, password is read from CRYPT_JSON_PWD environment variable.";

function run() {
    var args;
    try {
        args = helper.parseCommandLine();
        if (args.help) {
            console.log(usage);
        }
        else {
            console.log("Decrypting JSON file " + args.filename);
            secureStore.decryptJSON(args.filename, args.password, 2)
                .then(function () {
                    console.log("File decrypted");
                })
                .catch(function (err) {
                    console.error("Failed to decrypt file: " + err.message);
                });
        }
    }
    catch(err) {
        console.error(err.message);
        console.log(usage);
    }
}

run();
