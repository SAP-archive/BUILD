'use strict';

// @ngInject
module.exports = function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            if (!element[0] || !element[0].nodeName || element[0].nodeName !== 'TEXTAREA') {
                return;
            }

            function init() {
                window.addEventListener('resize', update);
                update();
            }
            function update() {
                if (attrs.flexTosHeight && attrs.flexTosHeight.length > 0) {
                    var flexHeight = parseFloat(attrs.flexTosHeight);
                    var clientHeight;
                    if (window.innerWidth) {
                        clientHeight = window.innerHeight;
                    }
                    else if (document.documentElement && document.documentElement.clientHeight !== 0) {
                        clientHeight = document.documentElement.clientHeight;
                    }
                    else if (document.body) {
                        clientHeight = document.body.clientHeight;
                    }
                    var height = clientHeight ? clientHeight * flexHeight / 100 : 300;
                    element[0].style.height = height + 'px';
                }
            }
            init();
        }
    };
};
