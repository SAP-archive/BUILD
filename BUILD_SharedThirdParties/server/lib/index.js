var transforms = [
    "./express",
    "./lodash-node"
];

module.exports = function (tp) {
    transforms.forEach(function (path) {
        var process = require(path);
        process(tp);
    });
};