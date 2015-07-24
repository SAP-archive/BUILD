var html2canvas = require('./build/html2canvas');
html2canvas(window, document);

// expose functionality
module.exports = {
    html2canvas: function (elements, opts) {
        return window.html2canvas(elements, opts);
    },
    src: html2canvas
};
