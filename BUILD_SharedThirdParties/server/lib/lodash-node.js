var callers = {};
var sourceRegExp = /\([^)]+\)/;

function getCaller() {
    var err = {};
    Error.captureStackTrace(err);
    var stack = err.stack.split('\n');
    stack = stack[3];
    var match = sourceRegExp.exec(stack);
    return (match ? match[0] : stack);
}

module.exports = function (tp) {
    tp['_lodash-node'] = tp['lodash'];
    Object.defineProperty(tp, 'lodash-node', {
        configurable: true,
        get: function () {
            var caller = getCaller();
            if (!callers[caller]) {
                console.warn('Deprecated lodash-node used by ' + caller + '. Migrate to lodash 3.8.0 instead');
                callers[caller] = 1;
            }
            return this['_lodash-node'];
        }
    });
};