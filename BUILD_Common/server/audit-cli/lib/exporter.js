var fs = require("fs");
// End of line constant
var EOL = require("os").EOL;

// All the properties that will be exported in the CSV
var properties = ["date", "category", "event", "user", "ipAddress", "username", "description", "details"];

// Entries processed
var count = 0;
// Number of entries to process before writing to file
var chunkSize = 1000;
// String buffer
var content = "";
var output;
var fd;

// Return the string representation of the data
function getString(data) {
    if (data === undefined) {
        return "";
    }
    // To avoid errors when writing dates
    if (data instanceof Date) {
        return data.toISOString();
    }
    if (data instanceof Object) {
        return JSON.stringify(data);
    }

    return data;
}

/* Module exporter.js */
module.exports = {
    // Write the CSV headers
    init: function (outputOptions) {
        output = outputOptions;
        // Erase the file if it already exists
        try {
            fd = fs.openSync(output.name, "w");
        } catch (e) {
            return false;
        }

        // Headers
        for (var i = 0; i < properties.length; i++) {
            fs.writeSync(fd, properties[i] + output.delimiter);
        }
        fs.writeSync(fd, EOL);
        return true;
    },

    // Append the given entry to the string buffer and write it to file when we processed enough entries
    append: function (entry) {
        for (var j = 0; j < properties.length - 1; j++) {
            content += getString(entry[properties[j]]) + output.delimiter;
        }
        content += getString(entry[properties[properties.length - 1]]) + EOL;

        count++;
        // Write to file
        if (count % chunkSize === 0) {
            fs.writeSync(fd, content);
            content = "";
        }
    },

    // Write the remaining buffer to the file and close it
    end: function () {
        fs.writeSync(fd, content);
        fs.closeSync(fd);
    }
};
