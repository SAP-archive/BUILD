/*eslint no-cond-assign: 0 */
'use strict';

var path = require('path');
var clientTP = require('norman-client-tp');
var _ = clientTP.lodash;

var URL = window.URL || window.webkitURL,
    prefix = '<script src="data:text/javascript,';
var html2canvasScript = prefix + encodeURIComponent('(' + clientTP.html2canvas.src.toString() + ')(window, document)') + '"></script>',
    injectScript = prefix + encodeURIComponent('(' + _injectCallback.toString()) + ')()"></script>';


/**
 *
 * @param files The array of files from the zip
 * @returns {Array} returns the array of files but with the specific axure files removed
 */
function _filterAxure(files) {
    var axureFileIndex = _.findIndex(files, function (file) {
        return file.filename.indexOf('axure-chrome-extension.crx') > -1;
    });

    if (axureFileIndex > -1) {
        return _.remove(files, function (file) {
            return file.filename.indexOf('__MACOSX') === -1 && file.filename.indexOf('start.html') === -1 && file.filename.indexOf('start_c_1.html') === -1 && file.filename.indexOf('start.html.orig') === -1 && file.filename.indexOf('index.html') === -1 && file.filename.indexOf('resources/expand.html') === -1 && file.filename.indexOf('resources/Other.html') === -1 && file.filename.indexOf('resources/reload.html') === -1 && file.filename.indexOf('resources/chrome/chrome.html') === -1 && file.filename.indexOf('resources/images/images.html') === -1 && file.filename.indexOf('resources/css/images/images.html') === -1 && file.filename.indexOf('plugins/sitemap/styles/images/images.html') === -1;
        });
    }
    return files;
}


function _convertImgToBase64URL(blob, callback) {
    var url = (window.URL || window.webkitURL).createObjectURL(blob),
        canvas = document.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        img = new Image();

    img.onload = function () {
        canvas.height = img.height;
        canvas.width = img.width;
        ctx.drawImage(img, 0, 0);
        callback(canvas.toDataURL());
        canvas = null;
    };

    img.src = url;
}


function _replaceAssetsURLsInText(file, type, dir, assets) {
    dir = dir || path.dirname(file.path);
    assets.forEach(function (asset) {
        file.html = file.html.replace(new RegExp(path.relative(dir, asset.path), 'g'), asset.url);
    });
    return {
        path: file.path,
        url: 'data:' + type + ',' + encodeURIComponent(file.html)
    };
}

function _injectCallback() {
    var errorHandler = function (event) {
        event.preventDefault();
        parent.postMessage({
            type: 'iframeCreateError',
            errorMsg: event.message
        }, '*');
    };
    window.addEventListener('error', errorHandler, true);

    window.addEventListener('load', function () {
        window.html2canvas(document.body, {
            onrendered: function (canvas) {
                parent.postMessage({id: 'id-placeholder', screen: canvas.toDataURL('image/png')}, '*');
            }
        });
    });
}


/**
 * Fixes up the urls in html page so that they refer to the correct location.
 * @param page
 * @param assets
 * @param scripts
 * @private
 */
function _replaceAssetsURLsInPage(page, assets, scripts, iframe, id) {
    var dir = path.dirname(page.path);
    assets.forEach(function (ast) {
        page.html = page.html.replace(new RegExp(path.relative(dir, ast.path), 'g'), ast.url);
    });

    // replace asset urls in script files using as base path the one of the page cointaining the script
    for (var i = 0; i < scripts.length; i++) {
        if (page.html.indexOf(path.relative(dir, scripts[i].path)) >= 0) {
            var asset = _replaceAssetsURLsInText(scripts[i], 'text/javascript', dir, assets);
            page.html = page.html.replace(new RegExp(path.relative(dir, scripts[i].path), 'g'), asset.url);
            scripts.splice(i, 1);
            assets.push(asset);
            i--;
        }
    }
    page.html = page.html.replace(/<head>/i, '<head>' + html2canvasScript + injectScript.replace('id-placeholder', id));
    var blob = new Blob([page.html], {
        type: 'text/html'
    });
    var blobURL = URL.createObjectURL(blob);
    iframe.setAttribute('src', blobURL);
}

function _getEntries(zip, file, cb, errcb) {
    zip.createReader(new zip.BlobReader(file), function (zipReader) {
        zipReader.getEntries(function (e) {
            cb(_filterAxure(e));
        });
    }, errcb);
}


module.exports = {
    filterAxure: _filterAxure,
    getEntries: _getEntries,
    convertImgToBase64URL: _convertImgToBase64URL,
    replaceAssetsURLsInText: _replaceAssetsURLsInText,
    replaceAssetsURLsInPage: _replaceAssetsURLsInPage
};
