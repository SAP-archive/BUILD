var argsModule = require("./arguments.js");
var exporter = require("./exporter.js");
var mongo = require("./mongo.js");

var options = argsModule.parse(process.argv);

// No arguments specified
if (options === null) {
    argsModule.printUsage(false);
} else if (options.help) {
    argsModule.printUsage(true);
} else {
    // Initialize the connection and write the entries
    mongo.connect(options.connection, connectHandler);
}

// If no errors were thrown while connecting to mongodb, start the export process.
// Exit the process otherwise
function connectHandler(err) {
    if (err) {
        console.error(err);
        mongo.close();
    } else {
        mongo.log(options, exporter, logHandler);
    }
}

function logHandler(err) {
    if (err) {
        console.error(err);
    }
    mongo.close();
}
