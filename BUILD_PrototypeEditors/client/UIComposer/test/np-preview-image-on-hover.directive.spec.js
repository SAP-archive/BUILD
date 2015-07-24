'use strict';
(function () {

    var expect = chai.expect;

    describe('Directive: np-preview-image-on-hover', function () {
        var elem, scope;

        beforeEach(module('uiComposer.uiEditor'));

        beforeEach(function () {
            var jQueryMock = function (element) {
                element.offset = function () {
                    return {
                        top: 0,
                        left: 0
                    };
                };
                element.height = function () {
                    return 0;
                };
                element.width = function () {
                    return 0;
                };
                return element;
            };

            module(function ($provide) {
                $provide.value('jQuery', jQueryMock);
            });

            inject(function ($rootScope, $compile) {
                elem = angular.element('<div drag-data="{assetSrc:\'/api/asset\'}" np-preview-image-on-hover></div>');
                scope = $rootScope.$new();
                elem = $compile(elem)(scope);
                scope.$digest();
            });
        });

        it('should append a preview to the document on mouseenter', function () {
            elem.triggerHandler('mouseenter');
            var previewImg = document.querySelector('.np-e-preview-image');
            expect(previewImg).to.not.be.null;
            elem.triggerHandler('mouseleave');
        });

        it('should set that previews src', function () {
            elem.triggerHandler('mouseenter');
            var previewImg = angular.element(document.querySelector('.np-e-preview-image'));
            expect(previewImg.attr('src')).to.be.equal('/api/asset');
            elem.triggerHandler('mouseleave');
        });

        it('should do some positional computation to show the element at the right position', function () {
            elem.triggerHandler('mouseenter');
            var previewImg = angular.element(document.querySelector('.np-e-preview-image'));
            expect(previewImg.css('top')).to.not.be.undefined;
            expect(previewImg.css('left')).to.not.be.undefined;
            elem.triggerHandler('mouseleave');
        });

        it('should remove the preview on mouseleave', function () {
            elem.triggerHandler('mouseenter');
            elem.triggerHandler('mouseleave');
            var previewImg = document.querySelector('.np-e-preview-image');
            expect(previewImg).to.be.null;
        });
    });
})();
