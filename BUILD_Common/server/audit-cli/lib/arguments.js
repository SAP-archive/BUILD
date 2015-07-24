var path = require("path");

// The configuration of the export
var options = {
    // Search criteria for the mongodb find() method
    criteria: {
    },
    // Options of the output file
    output: {
        format: "csv",
        name: "dump.csv",
        delimiter: ";"
    },
    // Operations on the mongodb results set (sort, limit ...)
    result: {
        // By default, sort by most recent date
        sort: "-date",
        limit: ""
    },
    connection: {
        user: "",
        pwd: "",
        host: "localhost",
        port: "27017"
    }
};

// All the possible arguments options
var argsMap = [
    /* Connection */
    {
        // params[0]: Option written with a single dash (ex: -c authentication)
        // params[1]: Option written with 2 dashes (ex: --category=authentication)
        param: "u",
        description: "set the mongodb user",
        assign: function (value) { options.connection.user = value; }
    },
    {
        param: "p",
        description: "set the mongodb password",
        assign: function (value) { options.connection.pwd = value; }
    },
    /* Mongodb criteria */
    {
        param: "category",
        description: "specify the category value",
        // Setter
        assign: function (value) { options.criteria.category = new RegExp(value); }
    },
    {
        param: "event",
        description: "specify the event value",
        assign: function (value) { options.criteria.event = new RegExp(value); }
    },
    {
        param: "user",
        description: "specify the user value",
        assign: function (value) { options.criteria.user = new RegExp(value); }
    },
    {
        param: "username",
        description: "specify the username value",
        assign: function (value) { options.criteria.username = new RegExp(value); }
    },
    {
        param: "date",
        description: "specify the date value (YYYY-MM-DD)",
        assign: function (value) { updateDate(value); }
    },
    {
        param: "ip",
        description: "specify the ip value",
        assign: function (value) { options.criteria.ipAddress = value; }
    },
    {
        param: "description",
        description: "specify the description value",
        assign: function (value) { options.criteria.description = new RegExp(value); }
    },
    {
        param: "from",
        description: "specify the oldest date value",
        assign: function (value) {
            if (!options.criteria.date) {
                options.criteria.date = {};
            }
            options.criteria.date.$gte = value;
        }
    },
    {
        param: "to",
        description: "specify the newest date value",
        assign: function (value) {
            if (!options.criteria.date) {
                options.criteria.date = {};
            }
            options.criteria.date.$lte = value;
        }
    },
    /* Output file options */
    {
        param: "delimiter",
        description: "set the delimiter for the csv file (default: ;)",
        assign: function (value) { options.output.delimiter = value; }
    },
    {
        param: "output",
        description: "set the name of the output file",
        assign: function (value) { options.output.name = value; }
    },
    /* Results set options */
    {
        param: "sort",
        description: "sort the result on the given value in ascending order " +
                     "(put \"-\" in front of the value to sort in descending order)",
        assign: function (value) { options.result.sort = value; }
    },
    {
        param: "limit",
        description: "limit the number of results",
        assign: function (value) { options.result.limit = value; }
    },
    /* Config file */
    {
        param: "config",
        description: "load the given config file",
        assign: function (value) { options.config = value; }
    }
];

// Parse the date given by the user
function updateDate(value) {
    var date = new Date(value);
    var tomorrow = new Date(date);
    tomorrow.setDate(date.getDate() + 1);

    options.criteria.date = {};
    options.criteria.date.$lt = tomorrow;
    options.criteria.date.$gte = date;
}

// Display the usage and the options on the terminal
function printUsage(showOptions) {
    console.log("usage: node app.js uri [options]");
    console.log("uri: [host[:port]/]database");
    console.log("options :");
    console.log("-h, --help : display all the available options");
    if (showOptions) {
        for (var i = 0; i < argsMap.length; i++) {
            var item = argsMap[i];
            var str = item.param;
            str = (item.param.length === 1 ? " -" : " --") + str + " : " + item.description;
            console.log(str);
        }
    }
}

// Set the options properties
function updateOptions(args) {
    for (var prop in args) {
        for (var i = 0; i < argsMap.length; i++) {
            var item = argsMap[i];
            if (item.param === prop) {
                item.assign(args[prop]);
            }
        }
    }
}

// Parse the user input to extract the mongodb connection parameters
// Valid uri:
// 0: host:port/database
// 1: host/database
// 2: database
function parseMongoUri(uri) {
    var indexColon = uri.indexOf(":");
    var indexSlash = uri.indexOf("/");

    // Database and host
    if (indexSlash !== -1) {
        options.connection.db = uri.substring(indexSlash + 1, uri.length);
        options.connection.host = uri.substring(0, (indexColon !== -1 ? indexColon : indexSlash));
    } else {
        options.connection.db = uri;
    }

    // Port
    if (indexColon !== -1) {
        options.connection.port = uri.substring(indexColon + 1, indexSlash);
    }
}

function loadConfig() {
    try {
        var configPath = path.join(process.cwd(), options.config);
        var config = require(configPath);
        updateOptions(config);
    } catch (e) {
        console.error("Error: could not open config file " + options.config);
    }
}

// Return the options object with all the configuration
// or null if the user did not specify an output file name
function parseArgs(args) {
    var argv = require("minimist")(args.slice(2));

    // The user just wants to print the usage
    options.help = argv.h || argv.help || false;
    if (options.help) {
        return options;
    }

    // The mongodb uri has to be specified
    if (argv._.length !== 1) {
        return null;
    }

    parseMongoUri(argv._[0]);
    updateOptions(argv);
    // Load the config file if needed
    if (options.config) {
        loadConfig();
    }

    return options;
}

/* Module arguments.js */
module.exports.parse = parseArgs;
module.exports.printUsage = printUsage;
