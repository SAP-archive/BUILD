"use strict";

function isFunction(x) {
    return (typeof x === "function");
}

function isObjectOrFunction(x) {
    return (isFunction(x) || (typeof x === "object" && x !== null));
}

function isThenable(x) {
    // Note that accessing x.then might throw an exception
    // Thus isThenable must always be called inside a try/catch block (leading to a possible rejection)
    return (isObjectOrFunction(x) && isFunction(x.then));
}

function nop() {
}

function delayCall(fn, value, delay) {
    setTimeout(function () {
        fn(value);
    }, delay);
}

function fnCall(args) {
    var result, useCall, thisArg, fn, argLen = args.length;
    if (argLen === 0) {
        throw new TypeError("Cannot call undefined function");
    }
    thisArg = args[0];
    if (typeof thisArg === "function") {
        switch (argLen) {
            case 1:
                result = thisArg();
                break;
            case 2:
                result = thisArg(args[1]);
                break;
            case 3:
                result = thisArg(args[1], args[2]);
                break;
            case 4:
                result = thisArg(args[1], args[2], args[3]);
                break;
            case 5:
                result = thisArg(args[1], args[2], args[3], args[4]);
                break;
            default:
                result = thisArg.apply(undefined, Array.prototype.slice.call(args, 1));
                break;
        }
    }
    else {
        fn = args[1];
        switch (typeof fn) {
            case "string":
                useCall = false;
                break;
            case "function":
                useCall = true;
                break;
            default:
                throw new TypeError("Object method must be passed as string or function in invoke");
        }
        switch (argLen) {
            case 2:
                result = (useCall ? fn.call(thisArg) : thisArg[fn]());
                break;
            case 3:
                result = (useCall ? fn.call(thisArg, args[2]) : thisArg[fn](args[2]));
                break;
            case 4:
                result = (useCall ? fn.call(thisArg, args[2], args[3]) : thisArg[fn](args[2], args[3]));
                break;
            case 5:
                result = (useCall ? fn.call(thisArg, args[2], args[3], args[4]) : thisArg[fn](args[2], args[3], args[4]));
                break;
            default:
                result = (useCall ? fn.apply(thisArg, Array.prototype.slice.call(args, 2)) : thisArg[fn].apply(thisArg, Array.prototype.slice.call(args, 2)));
                break;
        }
    }
    return result;
}

function invoke(args, done) {
    var result, useCall, thisArg, fn, argLen, applyArgs;
    if (typeof done !== "function") {
        return fnCall(args);
    }

    argLen = args.length;
    if (argLen === 0) {
        throw new TypeError("Cannot call undefined function");
    }
    thisArg = args[0];
    if (typeof thisArg === "function") {
        switch (argLen) {
            case 1:
                result = thisArg(done);
                break;
            case 2:
                result = thisArg(args[1], done);
                break;
            case 3:
                result = thisArg(args[1], args[2], done);
                break;
            case 4:
                result = thisArg(args[1], args[2], args[3], done);
                break;
            case 5:
                result = thisArg(args[1], args[2], args[3], args[4], done);
                break;
            default:
                applyArgs = Array.prototype.slice.call(args, 1);
                applyArgs.push(done);
                result = thisArg.apply(undefined, applyArgs);
                break;
        }
    }
    else {
        fn = args[1];
        switch (typeof fn) {
            case "string":
                useCall = false;
                break;
            case "function":
                useCall = true;
                break;
            default:
                throw new TypeError("Object method must be passed as string or function in invoke");
        }
        switch (argLen) {
            case 2:
                result = (useCall ? fn.call(thisArg, done) : thisArg[fn](done));
                break;
            case 3:
                result = (useCall ? fn.call(thisArg, args[2], done) : thisArg[fn](args[2], done));
                break;
            case 4:
                result = (useCall ? fn.call(thisArg, args[2], args[3], done) : thisArg[fn](args[2], args[3], done));
                break;
            case 5:
                result = (useCall ? fn.call(thisArg, args[2], args[3], args[4], done) : thisArg[fn](args[2], args[3], args[4], done));
                break;
            default:
                applyArgs = Array.prototype.slice.call(args, 2);
                applyArgs.push(done);
                result = (useCall ? fn.apply(thisArg, applyArgs) : thisArg[fn].apply(thisArg, applyArgs));
                break;
        }
    }
    return result;
}


module.exports = {
    isFunction: isFunction,
    isObjectOrFunction: isObjectOrFunction,
    isThenable: isThenable,
    nop: nop,
    delayCall: delayCall,
    fnCall: fnCall,
    invoke: invoke
};

