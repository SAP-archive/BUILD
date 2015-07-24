'use strict';

var npPreviewImageOnHover = ['$document', '$timeout', 'jQuery',
    function ($document, $timeout, jQuery) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var previewImg = angular.element('<img class="np-e-preview-image" src="' + scope.$eval(attrs.dragData).assetSrc + '"/>');

                var computePosition = function (img) {
                    var offset = jQuery(element).offset(),
                        wrappedImg = jQuery(img),
                        css = {};
                    css.top = (offset.top - wrappedImg.height() / 2) + 'px';
                    css.left = offset.left + jQuery(element).width() + 5 + 'px';
                    return css;
                };

                var mouseenter = function () {
                    $document.find('body').append(previewImg);
                    var css = computePosition(previewImg);
                    previewImg.css(css);
                };

                var mouseleave = function () {
                    previewImg.remove();
                };

                element.on('mouseenter', mouseenter);
                element.on('mouseleave', mouseleave);
            }
        };
    }
];

module.exports = npPreviewImageOnHover;
