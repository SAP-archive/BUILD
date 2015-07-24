var path = require("path");
var util = require("util");

function CommandLineError(message) {
    Error.captureStackTrace(this);
    this.message = message;
}
util.inherits(CommandLineError, Error);
CommandLineError.prototype.name = "CommandLineError";

function parseCommandLine () {
    var k, n, args = {}, argv = process.argv;
    n = argv.length;
    for (k = 2; k < n; ++k) {
        switch (argv[k]) {
            case "-h":
                args.help = true;
                break;
            case "-p":
                if (k >= n - 2) {
                    throw new CommandLineError("-p option requires an additional password argument");
                }
                args.password = argv[++k];
                break;
            case "-e":
                if (k >= n - 2) {
                    throw new CommandLineError("-e option requires an additional environment variable name argument");
                }
                args.password = process.env[argv[++k]];
                break;
            default:
                args.filename = path.resolve(argv[k]);
                break;
        }
    }
    if (!args.filename && !args.help) {
        throw new CommandLineError("Missing filename argument");
    }
    if (!args.password) {
        args.password = process.env.CRYPT_JSON_PWD;
    }
    return args;
}

module.exports = {
    CommandLineError: CommandLineError,
    parseCommandLine: parseCommandLine
};