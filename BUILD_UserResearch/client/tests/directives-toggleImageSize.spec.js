/*eslint no-unused-expressions: 0*/
'use strict';

describe('Unit tests for toggleImageSize directive', function () {
    var scope, parentScope, elem, parentElem, callbackSpy;

    var imageMargin = {
        top: 25,
        left: 25,
        bottom: 50,
        right: 25
    };

    var containerDimensions = {
        width: 1000,
        height: 1000
    };

    var template = '<div><div toggle-image-size="{{imageUrl}}" on-image-resize="onImageResize"></div></div>';
    // 20x21 pixel base64 encoded image
    var imageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAVCAYAAABG1c6oAAAAAXNSR0IArs4c6QAAAXZJREFUOBGt079Lw0AUB/D3YmJbh4C6dBAEaVMhVJCOLv4BgrMguNqAuKhzwFU7+KP4T4iDLlKxnQTBZlAqhYJF/wBxldA8764cpD9Sc7S33OW49+F7SR7AOMN1tdWL90Vwq7pkUC5UZ/uykU5o03esbgmRvsGnjfperqmpQvw8x5JTRhWAbrxidh4COiYdH1bKzZxyQokRwK23ax3JQIWrlsP2tpUSSgwAl6ETPEpMzD57JsrETtiDCYHa8Ouv1/ftr3z5ddbAVAUxuI4FDmLdbETwiRCcA2o7FNC951iH/4JRWPi6DDvhGN8bCapiI8E4GBCc1ovZg3DaoV85Dsav2Y8NTRgXk+8snG4AHBfrASeBcVC8Q7vUmOv2JuuAiBH+NSKOiG0BJpL6lminiJNxMV4uQETcjLBABeMGFtyXGUibP2xp9KOqGK/XOmlzbVIYB3UMKA8a70Bqs2Z/ZouaT1B5c6wPfkB5LJSeUpmzlqlcGFHwBzjhrmQ7pdvAAAAAAElFTkSuQmCC';


    beforeEach(module('UserResearch'));
    beforeEach(module('common.ui.elements'));
    beforeEach(module('common.utils'));
    beforeEach(module('shell.aside'));
    beforeEach(module('shell.dashboard'));
    beforeEach(module('shell.projectLandingPage'));

    beforeEach(inject(function ($rootScope, $compile) {
        parentScope = $rootScope.$new();
        parentScope.imageUrl = imageData;
        parentScope.onImageResize = function () {};
        callbackSpy = sinon.spy(parentScope, 'onImageResize');

        parentElem = $compile(template)(parentScope);
        elem = parentElem.children();
        parentScope.$digest();
        scope = parentScope.$$childHead;
        scope.imageContainer[0].getBoundingClientRect = function () {
            return containerDimensions;
        };
    }));


    it('should detect the image dimensions', function (done) {
        // wait for the image load callback to be called
        setTimeout(function () {
            expect(scope.imageDimensions.height).to.be.equal(21);
            expect(scope.imageDimensions.width).to.be.equal(20);
            done();
        }, 200);
    });


    it('should call the resize callback', function (done) {
        setTimeout(function () {
            callbackSpy.should.have.been.calledWith(scope.scale);
            done();
        }, 200);
    });


    it('should resize the image if it is bigger than his container and toggleScaled is called', function (done) {
        scope.imageDimensions = {
            height: 2000,
            width: 2000
        };

        scope.toggleScaled();
        expect(scope.imageBiggerThanContainer).to.be.true;
        expect(scope.scale).to.be.equal(0.4625);

        expect(elem.css('width')).to.be.equal('925px');
        expect(elem.css('height')).to.be.equal('925px');
        expect(elem.css('marginTop')).to.be.equal('37.5px');
        expect(elem.css('marginLeft')).to.be.equal('37.5px');

        callbackSpy.should.have.been.calledWith(0.4625);
        done();
    });

    it('should not resize the image if it is smaller than his container and toggleScaled is called', function (done) {
        scope.imageDimensions = {
            height: 500,
            width: 500
        };

        scope.toggleScaled();
        expect(scope.imageBiggerThanContainer).to.be.false;
        expect(scope.scale).to.be.equal(1);

        expect(elem.css('width')).to.be.equal('500px');
        expect(elem.css('height')).to.be.equal('500px');
        expect(elem.css('marginTop')).to.be.equal('250px');
        expect(elem.css('marginLeft')).to.be.equal('250px');

        callbackSpy.should.have.been.calledWith(1);

        done();
    });


    it('should not resize the image if it is smaller than his container and toggleFull is called', function (done) {
        scope.imageDimensions = {
            height: 500,
            width: 500
        };

        scope.toggleFull();
        expect(scope.imageBiggerThanContainer).to.be.false;
        expect(scope.scale).to.be.equal(1);

        expect(elem.css('width')).to.be.equal('500px');
        expect(elem.css('height')).to.be.equal('500px');
        expect(elem.css('marginTop')).to.be.equal('250px');
        expect(elem.css('marginLeft')).to.be.equal('250px');

        callbackSpy.should.have.been.calledWith(1);

        done();
    });


    it('should not resize the image if it is bigger than his container and toggleFull is called', function (done) {
        scope.imageDimensions = {
            height: 2000,
            width: 2000
        };

        scope.toggleFull();
        expect(scope.imageBiggerThanContainer).to.be.true;
        expect(scope.scale).to.be.equal(1);

        expect(elem.css('width')).to.be.equal('2000px');
        expect(elem.css('height')).to.be.equal('2000px');
        expect(elem.css('marginTop')).to.be.equal(imageMargin.top + 'px');
        expect(elem.css('marginLeft')).to.be.equal(imageMargin.left + 'px');

        callbackSpy.should.have.been.calledWith(1);
        done();
    });


});
