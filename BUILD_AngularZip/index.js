var URL = window.URL || window.webkitURL;
var Blob = window.Blob;

//PhantomJS workaround
try {
    new Blob(['test']);
} catch(e) {
    Blob = function(){};
}

if (!URL) {
    URL = {
        createObjectURL: function() {}
    };
}


function createURL(func) {
    var code = ['(', func.toString(), ')()'];
    return URL.createObjectURL(new Blob(code, {type: 'application/javascript'}));
}

var zWorkerURL = createURL(require('./src/z-worker.js'));
var DEFAULT_WORKER_SCRIPTS = {
    deflater: [zWorkerURL, createURL(require('./src/deflate.js'))],
    inflater: [zWorkerURL, createURL(require('./src/inflate.js'))]
};


angular.module('zip', [])

    .factory('zip', function(){
        var obj = {};
        require('./src/zip')(obj, DEFAULT_WORKER_SCRIPTS);
        require('./src/mime-types')(obj.zip);
        return obj.zip;
    });