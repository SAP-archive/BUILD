var fs = require("fs");
var path = require("path");
var crypto = require("crypto");

require("node-sap-promise");
var expect = require("chai").expect;
var secureStore = require("../index.js");

var password = "Oops, no magic today!";
var objConfigFile = path.join(__dirname, "../tmp/object-config.json");
var strConfigFile = path.join(__dirname, "../tmp/string-config.json");
var bufferConfigFile = path.join(__dirname, "../tmp/buffer-config.json");
var jsonConfigFile = path.join(__dirname, "../tmp/json-config.json");
var jsonEncryptedConfigFile = path.join(__dirname, "../tmp/json-enc-config.json");
var binConfigFile = path.join(__dirname, "../tmp/bin-config.json");
var binEncryptedConfigFile = path.join(__dirname, "../tmp/bin-enc-config.json");

var objConfig = {
    foo: "bar",
    toto: {
        a: 1,
        b: 2
    }
};
var strConfig = "A simple string-based config";
var bufferConfig = new Buffer([0, 1, 2, 3, 4, 5, 6, 7]);

var savedArgs = process.argv.slice();
process.env.CRYPT_JSON_PWD = password;

function testPassed(done) {
    return function () {
        done();
    };
}
function testFailed(done) {
    return function (err) {
        done(err);
    };
}
function preventOnFulfilled() {
    throw new Error("Promise should not be fulfilled");
}

function checkTempDir() {
    var tempPath = path.join(__dirname, "../tmp");
    if (!fs.existsSync(tempPath)) {
        fs.mkdirSync(tempPath);
    }
}

function deleteConfigFiles() {
    var files = [ objConfigFile, strConfigFile, bufferConfigFile, jsonConfigFile, jsonEncryptedConfigFile, binConfigFile, binEncryptedConfigFile ];
    files.forEach(function (file) {
        try {
            fs.unlinkSync(file);
        }
        catch (err) {
            // ignore errors
        }
    });
}

function mockRun(scriptFile, args, done) {
    var error, binFile = require.resolve(scriptFile);
    delete require.cache[binFile];
    process.argv = savedArgs.slice(0, 2).concat(args);
    console.log("Running " + scriptFile + " with arguments: ", process.argv);
    try {
        require(scriptFile);
    }
    catch (err) {
        error = err;
    }
    process.argv = savedArgs;
    if (error) {
        done(error);
    }
    else {
        Promise.delay(200).callback(done);
    }
}

describe("node-sap-secure-conf", function () {
    before(checkTempDir);
    before(deleteConfigFiles);
    after(deleteConfigFiles);

    describe("readSecureData", function () {
        it("should decrypt an object configuration", function (done) {
            secureStore.readSecureData(path.join(__dirname, "data/object-config.json"), password)
                .then(function (config) {
                    expect(config).to.be.an("object");
                    expect(config).to.deep.equal(objConfig);
                })
                .then(testPassed(done), testFailed(done));
        });
        it("should decrypt a string configuration", function (done) {
            secureStore.readSecureData(path.join(__dirname, "data/string-config.json"), password)
                .then(function (config) {
                    expect(config).to.be.a("string");
                    expect(config).to.equal(strConfig);
                })
                .then(testPassed(done), testFailed(done));
        });
        it("should decrypt a buffer configuration", function (done) {
            secureStore.readSecureData(path.join(__dirname, "data/buffer-config.json"), password)
                .then(function (config) {
                    var k;
                    expect(Buffer.isBuffer(config)).to.be.true;
                    expect(config.length).to.equal(8);
                    for (k = 0; k < 8; ++k) {
                        expect(config[k]).to.equal(k);
                    }
                })
                .then(testPassed(done), testFailed(done));
        });
        it("should fail on invalid data type", function (done) {
            secureStore.readSecureData(path.join(__dirname, "data/invalid-config.json"), password)
                .then(preventOnFulfilled, function (err) {
                    expect(err).to.be.an.instanceof(TypeError);
                })
                .then(testPassed(done), testFailed(done));
        });
        it("should fail for an invalid password", function (done) {
            secureStore.readSecureData(path.join(__dirname, "data/object-config.json"), "bad password")
                .then(preventOnFulfilled, function (err) {
                    expect(err).to.be.an.instanceof(Error);
                })
                .then(testPassed(done), testFailed(done));
        });
        it("should fail for an invalid input file", function (done) {
            secureStore.readSecureData(path.join(__dirname, "data/bad-config.json"), password)
                .then(preventOnFulfilled, function (err) {
                    expect(err).to.be.an.instanceof(TypeError);
                })
                .then(testPassed(done), testFailed(done));
        });
    });
    describe("writeSecureData", function () {
        it("should encrypt an object configuration", function (done) {
            secureStore.writeSecureData(objConfigFile, objConfig, password)
                .then(function () {
                    return secureStore.readSecureData(objConfigFile, password);
                })
                .then(function (config) {
                    expect(config).to.be.an("object");
                    expect(config).to.deep.equal(objConfig);
                })
                .then(testPassed(done), testFailed(done));
        });
        it("should encrypt a string configuration", function (done) {
            secureStore.writeSecureData(strConfigFile, strConfig, password)
                .then(function () {
                    return secureStore.readSecureData(strConfigFile, password);
                })
                .then(function (config) {
                    expect(config).to.be.a("string");
                    expect(config).to.equal(strConfig);
                })
                .then(testPassed(done), testFailed(done));
        });
        it("should encrypt a buffer configuration", function (done) {
            secureStore.writeSecureData(bufferConfigFile, bufferConfig, password)
                .then(function () {
                    return secureStore.readSecureData(bufferConfigFile, password);
                })
                .then(function (config) {
                    var k;
                    expect(Buffer.isBuffer(config)).to.be.true;
                    expect(config.length).to.equal(8);
                    for (k = 0; k < 8; ++k) {
                        expect(config[k]).to.equal(k);
                    }
                })
                .then(testPassed(done), testFailed(done));
        });
        it("should fail on other type of data", function (done) {
            secureStore.writeSecureData(bufferConfigFile, 42, password)
                .then(preventOnFulfilled, function (err) {
                    expect(err).to.be.an.instanceof(TypeError);
                })
                .then(testPassed(done), testFailed(done));
        });
        it("should fail if crypto.randomBytes fails", function (done) {
            var randomBytes = crypto.randomBytes;
            crypto.randomBytes = function () {
                throw new Error("Entropy sources drained");
            };
            secureStore.writeSecureData(bufferConfigFile, objConfig, password)
                .then(preventOnFulfilled, function (err) {
                    expect(err).to.be.an.instanceof(Error);
                })
                .then(testPassed(done), testFailed(done));
            crypto.randomBytes = randomBytes;
        });
        it("should support a missing or empty password", function (done) {
            secureStore.writeSecureData(objConfigFile, objConfig)
                .then(function () {
                    return secureStore.readSecureData(objConfigFile)
                })
                .then(function (config) {
                    expect(config).to.be.an("object");
                    expect(config).to.deep.equal(objConfig);
                })
                .then(testPassed(done), testFailed(done));
        });
        it("should support custom options", function (done) {
            secureStore.writeSecureData(objConfigFile, objConfig, password, { iterationCount: 1000 })
                .then(function () {
                    return secureStore.readSecureData(objConfigFile, password)
                })
                .then(function (config) {
                    expect(config).to.be.an("object");
                    expect(config).to.deep.equal(objConfig);
                })
                .then(testPassed(done), testFailed(done));
        });
        it("should support custom options with an empty password", function (done) {
            secureStore.writeSecureData(objConfigFile, objConfig, { iterationCount: 1000 })
                .then(function () {
                    return secureStore.readSecureData(objConfigFile)
                })
                .then(function (config) {
                    expect(config).to.be.an("object");
                    expect(config).to.deep.equal(objConfig);
                })
                .then(testPassed(done), testFailed(done));
        });
    });
    describe("cryptJSON", function () {
        it("should encrypt a JSON configuration file", function (done) {
            Promise.invoke(fs.writeFile, jsonConfigFile, JSON.stringify(objConfig))
                .then(function () {
                    return secureStore.cryptJSON(jsonConfigFile, password);
                })
                .then(function () {
                    return secureStore.readSecureData(jsonConfigFile, password);
                })
                .then(function (config) {
                    expect(config).to.be.an("object");
                    expect(config).to.deep.equal(objConfig);
                })
                .then(testPassed(done), testFailed(done));
        });
    });
    describe("decryptJSON", function () {
        it("should decrypt a JSON configuration file", function (done) {
            Promise.invoke(fs.writeFile, jsonEncryptedConfigFile, JSON.stringify(objConfig))
                .then(function () {
                    return secureStore.cryptJSON(jsonEncryptedConfigFile, password);
                })
                .then(function () {
                    return secureStore.decryptJSON(jsonEncryptedConfigFile, password);
                })
                .then(function () {
                    return Promise.invoke(fs.readFile, jsonEncryptedConfigFile, { encoding: "utf-8" });
                })
                .then(function (content) {
                    var config = JSON.parse(content);
                    expect(config).to.be.an("object");
                    expect(config).to.deep.equal(objConfig);
                })
                .then(function () {
                    return secureStore.cryptJSON(jsonEncryptedConfigFile, password);
                })
                .then(function () {
                    return secureStore.decryptJSON(jsonEncryptedConfigFile, password, 2);
                })
                .then(function () {
                    return Promise.invoke(fs.readFile, jsonEncryptedConfigFile, { encoding: "utf-8" });
                })
                .then(function (content) {
                    var config = JSON.parse(content);
                    expect(config).to.be.an("object");
                    expect(config).to.deep.equal(objConfig);
                    expect(content.search(/\n|\r/)).to.not.equal(-1); // Check that optional indentLevel parameter yields a multi-line JSON output
                })
                .then(testPassed(done), testFailed(done));
        });
    });
    describe("bin/cryptJSON", function () {
        this.slow(600);
        it("should require a filename argument", function (done) {
            mockRun("../bin/cryptjson.js", [], done);
        });
        it("should require a password argument after -p option", function (done) {
            mockRun("../bin/cryptjson.js", [ "-p", binConfigFile ], done);
        });
        it("should require an environment variable name argument after -e option", function (done) {
            mockRun("../bin/cryptjson.js", [ "-e", binConfigFile ], done);
        });
        it("should fail on a missing file", function (done) {
            mockRun("../bin/cryptjson.js", [ "NonExistingFile.json" ], done);
        });
        it("should display help", function (done) {
            mockRun("../bin/cryptjson.js", [ "-h" ], done);
        });
        it("should encrypt a JSON configuration file with CRYPT_JSON_PWD environment variable as default password", function (done) {
            Promise.invoke(fs.writeFile, binConfigFile, JSON.stringify(objConfig))
                .then(function () {
                    var args = [ binConfigFile ];
                    return Promise.invoke(mockRun, "../bin/cryptjson.js", args);
                })
                .then(function () {
                    return secureStore.readSecureData(binConfigFile, password);
                })
                .then(function (config) {
                    expect(config).to.be.an("object");
                    expect(config).to.deep.equal(objConfig);
                })
                .then(testPassed(done), testFailed(done));
        });
        it("should encrypt a JSON configuration file with explicit password argument", function (done) {
            Promise.invoke(fs.writeFile, binConfigFile, JSON.stringify(objConfig))
                .then(function () {
                    var args = [ "-p", password, binConfigFile ];
                    return Promise.invoke(mockRun, "../bin/cryptjson.js", args);
                })
                .then(function () {
                    return secureStore.readSecureData(binConfigFile, password);
                })
                .then(function (config) {
                    expect(config).to.be.an("object");
                    expect(config).to.deep.equal(objConfig);
                })
                .then(testPassed(done), testFailed(done));
        });
        it("should encrypt a JSON configuration file reading password from a given environment variable", function (done) {
            Promise.invoke(fs.writeFile, binConfigFile, JSON.stringify(objConfig))
                .then(function () {
                    var args = [ "-e", "CRYPT_JSON_PWD", binConfigFile ];
                    return Promise.invoke(mockRun, "../bin/cryptjson.js", args);
                })
                .then(function () {
                    return secureStore.readSecureData(binConfigFile, password);
                })
                .then(function (config) {
                    expect(config).to.be.an("object");
                    expect(config).to.deep.equal(objConfig);
                })
                .then(testPassed(done), testFailed(done));
        });
    });
    describe("bin/decryptJSON", function () {
        this.slow(600);
        it("should require a filename argument", function (done) {
            mockRun("../bin/decryptjson.js", [], done);
        });
        it("should require a password argument after -p option", function (done) {
            mockRun("../bin/decryptjson.js", [ "-p", binEncryptedConfigFile ], done);
        });
        it("should require an environment variable name argument after -e option", function (done) {
            mockRun("../bin/decryptjson.js", [ "-e", binEncryptedConfigFile ], done);
        });
        it("should fail on a missing file", function (done) {
            mockRun("../bin/decryptjson.js", [ "NonExistingFile.json" ], done);
        });
        it("should display help", function (done) {
            mockRun("../bin/decryptjson.js", [ "-h" ], done);
        });
        it("should decrypt a JSON configuration file with CRYPT_JSON_PWD environment variable as default password", function (done) {
            Promise.invoke(fs.writeFile, binEncryptedConfigFile, JSON.stringify(objConfig))
                .then(function () {
                    return secureStore.cryptJSON(binEncryptedConfigFile, password);
                })
                .then(function () {
                    var args = [ binEncryptedConfigFile ];
                    return Promise.invoke(mockRun, "../bin/decryptjson.js", args);
                })
                .then(function () {
                    return Promise.invoke(fs.readFile, binEncryptedConfigFile, { encoding: "utf-8" });
                })
                .then(function (content) {
                    var config = JSON.parse(content);
                    expect(config).to.be.an("object");
                    expect(config).to.deep.equal(objConfig);
                })
                .then(testPassed(done), testFailed(done));
        });
        it("should decrypt a JSON configuration file with explicit password argument", function (done) {
            Promise.invoke(fs.writeFile, binEncryptedConfigFile, JSON.stringify(objConfig))
                .then(function () {
                    return secureStore.cryptJSON(binEncryptedConfigFile, password);
                })
                .then(function () {
                    var args = [ "-p", password, binEncryptedConfigFile ];
                    return Promise.invoke(mockRun, "../bin/decryptjson.js", args);
                })
                .then(function () {
                    return Promise.invoke(fs.readFile, binEncryptedConfigFile, { encoding: "utf-8" });
                })
                .then(function (content) {
                    var config = JSON.parse(content);
                    expect(config).to.be.an("object");
                    expect(config).to.deep.equal(objConfig);
                })
                .then(testPassed(done), testFailed(done));
        });
        it("should decrypt a JSON configuration file reading password from a given environment variable", function (done) {
            Promise.invoke(fs.writeFile, binEncryptedConfigFile, JSON.stringify(objConfig))
                .then(function () {
                    return secureStore.cryptJSON(binEncryptedConfigFile, password);
                })
                .then(function () {
                    var args = [ "-p", password, "-e", "CRYPT_JSON_PWD", binEncryptedConfigFile ];
                    return Promise.invoke(mockRun, "../bin/decryptjson.js", args);
                })
                .then(function () {
                    return Promise.invoke(fs.readFile, binEncryptedConfigFile, { encoding: "utf-8" });
                })
                .then(function (content) {
                    var config = JSON.parse(content);
                    expect(config).to.be.an("object");
                    expect(config).to.deep.equal(objConfig);
                })
                .then(testPassed(done), testFailed(done));
        });
    });
});

