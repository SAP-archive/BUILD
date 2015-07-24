"use strict";
var formatter, dateFormatter, utcFormatter, dateFormat, padding;

formatter = {};
padding = [ "", "0", "00", "000", "0000" ];
dateFormat = /\\.|d+|h+|H+|m+|M+|s+|y+|f+|[^dhHmMsyf]+/g;

module.exports = {
    formatDate: formatDate,
    formatName: formatName
};

function formatEnv(name) {
    return process.env[name] || "";
}

function formatDate(dt, format, utc) {
    var output, match, dtFormat;
    format = format || "yyyyMMdd@hhmmss";
    dtFormat = (utc ? utcFormatter : dateFormatter);
    output = "";
    while ((match = dateFormat.exec(format)) !== null) {
        match = match[0];
        if (match[0] === "\\") {
            output += match[1];
        }
        else if (dtFormat[match]) {
            output += dtFormat[match](dt);
        }
        else {
            output += match;
        }
    }
    return output;
}

function formatName(strFormat) {
    var start, next, end, output, token, format;
    start = 0;
    end = strFormat.length;
    output = "";
    while (start < end) {
        next = strFormat.indexOf("{", start);
        if (next === -1) {
            output = (start ? output + strFormat.slice(start) : strFormat);
            break;
        }
        output += strFormat.slice(start, next);
        if (++next >= end) {
            break; // handle badly escaped { at end of string
        }
        start = next;
        if (strFormat[next] !== "{") {
            // read token and formatting directive
            next = strFormat.indexOf("}", start);
            if (next === -1) {
                // verbatim output of ill formed token
                output += strFormat.slice(start);
                break;
            }
            token = strFormat.slice(start, next);
            start = next + 1;
            next = token.indexOf(":");
            if (next === -1) {
                format = undefined;
            }
            else {
                format = token.slice(next + 1);
                token = token.slice(0, next);
            }
            if (!token) {
                continue;
            }
            if (typeof formatter[token] === "function") {
                output += formatter[token](format);
            }
            else if (token[0] === "$") {
                token = token.slice(1);
                output += formatEnv(token, format);
            }
        }
    }
    return output;
}

function pad(num, len) {
    var output = "" + num;
    if (output.length < len) {
        output = padding[len - output.length] + output;
    }
    return output;
}

formatter.pid = function () {
    return process.pid;
};

formatter.now = function (format) {
    return formatDate(new Date(), format);
};

formatter.utc = function (format) {
    return formatDate(new Date(), format, true);
};

dateFormatter = {
    d: function (dt) {
        return "" + dt.getDate();
    },
    dd: function (dt) {
        return pad(dt.getDate(), 2);
    },
    fff: function (dt) {
        return pad(dt.getMilliseconds(), 3);
    },
    h: function (dt) {
        var h = dt.getHours() % 12;
        if (h === 0) {
            h = 12;
        }
        return "" + h;
    },
    hh: function (dt) {
        var h = dt.getHours() % 12;
        if (h === 0) {
            h = 12;
        }
        return pad(h, 2);
    },
    "H": function (dt) {
        return "" + dt.getHours();
    },
    "HH": function (dt) {
        return pad(dt.getHours(), 2);
    },
    m: function (dt) {
        return "" + dt.getMinutes();
    },
    mm: function (dt) {
        return pad(dt.getMinutes(), 2);
    },
    "M": function (dt) {
        return "" + (dt.getMonth() + 1);
    },
    "MM": function (dt) {
        return pad(dt.getMonth() + 1, 2);
    },
    s: function (dt) {
        return "" + dt.getSeconds();
    },
    ss: function (dt) {
        return pad(dt.getSeconds(), 2);
    },
    y: function (dt) {
        return "" + (dt.getFullYear() % 100);
    },
    yy: function (dt) {
        return pad(dt.getFullYear() % 100, 2);
    },
    yyyy: function (dt) {
        return pad(dt.getFullYear(), 4);
    }
};

utcFormatter = {
    d: function (dt) {
        return "" + dt.getUTCDate();
    },
    dd: function (dt) {
        return pad(dt.getUTCDate(), 2);
    },
    fff: function (dt) {
        return pad(dt.getUTCMilliseconds(), 3);
    },
    h: function (dt) {
        var h = dt.getUTCHours() % 12;
        if (h === 0) {
            h = 12;
        }
        return "" + h;
    },
    hh: function (dt) {
        var h = dt.getUTCHours() % 12;
        if (h === 0) {
            h = 12;
        }
        return pad(h, 2);
    },
    "H": function (dt) {
        return "" + dt.getUTCHours();
    },
    "HH": function (dt) {
        return pad(dt.getUTCHours(), 2);
    },
    m: function (dt) {
        return "" + dt.getUTCMinutes();
    },
    mm: function (dt) {
        return pad(dt.getUTCMinutes(), 2);
    },
    "M": function (dt) {
        return "" + (dt.getUTCMonth() + 1);
    },
    "MM": function (dt) {
        return pad(dt.getUTCMonth() + 1, 2);
    },
    s: function (dt) {
        return "" + dt.getUTCSeconds();
    },
    ss: function (dt) {
        return pad(dt.getUTCSeconds(), 2);
    },
    y: function (dt) {
        return "" + (dt.getUTCFullYear() % 100);
    },
    yy: function (dt) {
        return pad(dt.getUTCFullYear() % 100, 2);
    },
    yyyy: function (dt) {
        return pad(dt.getUTCFullYear(), 4);
    }
};
