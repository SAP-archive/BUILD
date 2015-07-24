#!/usr/bin/env node
var helper = require("./helper.js");
var secureStore = require("../index.js");

var usage = "\nUsage: cryptjson [-p <password>] [-e <environment-variable>] filename | -h\n\nEncrypts a JSON configuration file ('cryptjson -h' displays this help).\n\n";
usage += "  -p <password> specifies that file will be encrypted using password '<password>'\n";
usage += "  -e <environment-variable> specifies that file will be encrypted using the password stored in the environment variable <environment-variable>\n";
usage += "  filename path of the JSON file to encrypt\n\n";
usage += "If neither -p nor -e options are used, password is read from CRYPT_JSON_PWD environment variable.";

function run() {
    var args;
    try {
        args = helper.parseCommandLine();
        if (args.help) {
            console.log(usage);
        }
        else {
            console.log("Encrypting JSON file " + args.filename);
            secureStore.cryptJSON(args.filename, args.password)
                .then(function () {
                    console.log("File encrypted");
                })
                .catch(function (err) {
                    console.error("Failed to encrypt file: " + err.message);
                });
        }
    }
    catch(err) {
        console.error(err.message);
        console.log(usage);
    }
}

run();
