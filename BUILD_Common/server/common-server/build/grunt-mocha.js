var path = require('path');
var testSrc = [];
var reTest = /^-t:(\S+)$/;

// command line arg -t:testCase to support selective test cases execution
process.argv.forEach(function (arg) {
    var match = reTest.exec(arg), test;
    if (match) {
        test = 'test/' + match[1];
        if (path.extname(test) !== ".js") {
            test += ".js";
        }
        testSrc.push(test);
    }
});
if (testSrc.length === 0) {
    testSrc.push('test/*Test.js');
}

module.exports = {
    options: {
        reporter: 'spec'
    },
    src: testSrc
};
