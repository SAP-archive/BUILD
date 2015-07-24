norman-promise
=======

ECMAScript 6 compliant Promise implementation with a few nice extensions.

#[API](API.md)

##Creating Promises 

###Standard Promise API

```javascript
var p = new Promise(function (resolve, reject) {
    // Do something async and eventually call resolve or reject
});
```

###Defer API

```javascript
var p = Promise.defer(); // Underlying promise is p.promise

// Do something async and eventually call p.resolve or p.reject
```

##Promise.prototype methods
###then(function: onFulfilled, function: onRejected)

```javascript
var p = new Promise(function (resolve, reject { ... })
                .then(function (result) {
                    // this will be called if promise is fulfilled
                }, function (err) {
                    // this will be called if promise is rejected
                });
```

###catch(function: onRejected) 

```javascript
var p = new Promise(function (resolve, reject { ... })
                .catch(function (err) {
                    // this will be called if promise is rejected
                });
```

###Correctly catching errors

```javascript
// Not recommanded: if something happen in the onFulfilled callback, onRejected will not be called
var p1 = new Promise(function (resolve, reject { ... })
                .then(onFulfilled, onRejected);
                
// Much better: if something happen in the onFulfilled callback, onRejected will be called
var p2 = new Promise(function (resolve, reject { ... })                 
                .then(onFulfilled)
                .catch(onRejected);
```

###finally(function: finalizer)

This promise extension allows having garbage collection code running without interfering with the promise chain

```javascript
var p = doSomethingAsync1()
            .then(function (result) {
                return doSomethingAsync2(result);
            })
            .finally(function () {
                // you may put cleanup code here, it will always be called
            })
            .then (function (result2) {
                // result2 is the resolved value of doSomethingAsync2(result)
            });
```

###callback(function(Error, any): done)
This promise extension allows supporting optional callbacks when promise is settled

```javascript
function myFunctionWithOptionalCallback(done) {
  return doSomethingAsync().callback(done);
}
```

 - p.callback(done) returns a promise which will be settled after p is settled
 
 - If done is a function, done will be called when p is settled 
 
 - Callback function follows standard node.js convention: 
 
   - if promise is fulfilled, result is passed as second parameter

   - if promised is rejected, error is passed as first parameter


##Promise.prototype properties

###id: Number
Unique promise identifier (could be useful for debugging)

###result: any
Once the promise is settled this property returns the promise result or reject error

###status: 
The status of the promise, possible values are

 - Promise.PENDING

 - Promise.FULFILLED

 - Promise.REJECTED


##Promise constructor methods

###Promise.resolve(any: resolution)
Returns a promise resolved with the given resolution. If the resolution is a Promise or a thenable object, the resulting promise will be settled when the resolution is settled and fulfilled or rejected accordingly. 

###Promise.reject(Error: err)
Returns a rejected promise with reason err. 

###Promise.cast(any: wrapped)
Returns a promise wrapping the wrapped input. 

 - if wrapped is a Promise, Promise.cast returns wrapped itself

 - otherwise, Promise.cast is equivalent to Promise.resolve. 

###Promise.all(Promise[]: promises)
Returns a promise with the following properties.

 - It will be fulfilled if/when all promises in promises array are fulfilled. In that case, it is fulfilled with an array of the promises results. 
 
 - it will be rejected if/when one the promises is rejected. In that case it is rejected with the reason of the rejected promise. 

###Promise.race(Promise[]: promises)
Returns a promise fulfilled/rejected with the result of the first promise to be settled. 

###Promise.waitAll(Promise[]: promises)
Returns a promise with the following properties

 - It will be settled when all promises are settled. 

 - If all promises are fulfilled, Promise.all will be fulfilled with an array of the promise results
 
 - If at least one promise is rejected, Promise.all will be rejected with an error object with a ```detail``` property
 
   - detail.failCount contains the number of rejected promises

   - detail.errors is an array of promise reject errors: if k-th promise is rejected ```detail.errors[k]``` contains the corresponding error otherwise ```detail.errors[k]``` is undefined
   
   - detail.results is an array of promise results: if k-th promise is fulfilled ```detail.results[k]``` contains the corresponding result otherwise ```detail.result[k]``` is undefined
   

###Promise.invoke(function: fn, ...)
Convert a standard node.js callback-based call to a promise-based one

```
var fs = require("fs");

var p = Promise.invoke(fs.open, "tempFile.txt", "r")
          .then(function (fd) {
            // If method returns a single value it is available as promise result
            var buffer = new Buffer(4096);
            return Promise.invoke(fs.read, fd, 0, 4096, 0)
                .then(function (result) {
                  // If method returns multiple values, the promise result wraps them in an array
                  var bytesRead = result[0];
                  var buf = result[1];
                });
          });
```
 
 
 



