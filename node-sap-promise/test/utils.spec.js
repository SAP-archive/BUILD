var expect = require("chai").expect;
var utils = require("../lib/utils.js");

function fnCall() {
    return utils.fnCall(arguments);
}
function getArguments() {
    return arguments;
}

describe("utils", function () {
    function echoArgs() {
        var k, len = arguments.length;
        var result = [];
        for (k = 0; k < len; ++k) {
            result.push(arguments[k]);
        }
        return result;
    }
    describe("fnCall", function () {
        it("should enable making a function call from an arguments object", function () {
            expect(function () {
                fnCall();
            }).to.throw(TypeError);
            expect(fnCall(echoArgs)).to.deep.equal([]);
            expect(fnCall(echoArgs, 1)).to.deep.equal([ 1 ]);
            expect(fnCall(echoArgs, 1, 2)).to.deep.equal([ 1, 2 ]);
            expect(fnCall(echoArgs, 1, 2, 3)).to.deep.equal([ 1, 2, 3 ]);
            expect(fnCall(echoArgs, 1, 2, 3, 4)).to.deep.equal([ 1, 2, 3, 4 ]);
            expect(fnCall(echoArgs, 1, 2, 3, 4, 5)).to.deep.equal([ 1, 2, 3, 4, 5 ]);
        });

        it("should enable making an object method call from an arguments object", function () {
            var obj = {
                echoArgs: function () {
                    var k, len = arguments.length;
                    var result = [ this ];
                    for (k = 0; k < len; ++k) {
                        result.push(arguments[k]);
                    }
                    return result;
                }
            };
            expect(function () {
                fnCall(obj);
            }).to.throw(TypeError);

            expect(fnCall(obj, obj.echoArgs)[0]).to.equal(obj);
            expect(fnCall(obj, obj.echoArgs, 1).slice(1)).to.deep.equal([ 1 ]);
            expect(fnCall(obj, obj.echoArgs, 1, 2).slice(1)).to.deep.equal([ 1, 2 ]);
            expect(fnCall(obj, obj.echoArgs, 1, 2, 3).slice(1)).to.deep.equal([ 1, 2, 3 ]);
            expect(fnCall(obj, obj.echoArgs, 1, 2, 3, 4).slice(1)).to.deep.equal([ 1, 2, 3, 4 ]);
            expect(fnCall(obj, obj.echoArgs, 1, 2, 3, 4, 5).slice(1)).to.deep.equal([ 1, 2, 3, 4, 5 ]);

            expect(fnCall(obj, "echoArgs")[0]).to.equal(obj);
            expect(fnCall(obj, "echoArgs", 1).slice(1)).to.deep.equal([ 1 ]);
            expect(fnCall(obj, "echoArgs", 1, 2).slice(1)).to.deep.equal([ 1, 2 ]);
            expect(fnCall(obj, "echoArgs", 1, 2, 3).slice(1)).to.deep.equal([ 1, 2, 3 ]);
            expect(fnCall(obj, "echoArgs", 1, 2, 3, 4).slice(1)).to.deep.equal([ 1, 2, 3, 4 ]);
            expect(fnCall(obj, "echoArgs", 1, 2, 3, 4, 5).slice(1)).to.deep.equal([ 1, 2, 3, 4, 5 ]);
        });
    });

    describe("invoke", function () {
        it("should fallback to fnCall if no callback is passed as last argument", function () {
            expect(utils.invoke(getArguments(echoArgs, 1))).to.deep.equal([ 1 ]);
        });
    });
});