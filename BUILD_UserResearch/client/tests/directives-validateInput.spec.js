'use strict';

describe('Unit tests for validateInput directive', function () {
    var scope, el;

    beforeEach(module('UserResearch'));
    beforeEach(module('common.ui.elements'));
    beforeEach(module('common.utils'));
    beforeEach(module('shell.aside'));
    beforeEach(module('shell.dashboard'));
    beforeEach(module('shell.projectLandingPage'));



    beforeEach(inject(function ($rootScope, $compile) {
        scope = $rootScope.$new();
        scope.val = '';
        el = $compile('<input ng-model="val" validate-input>')(scope);
    }));


    it('should have no value', function () {
        scope.$digest();
        expect(el.val()).to.be.equal('');
    });

    it('should validate simple string value', function () {
        scope.val = 'test1';
        scope.$digest();
        expect(el.val()).to.be.equal('test1');
    });

    it('should remove html tags', function () {
        scope.val = '<test2>';
        scope.$digest();
        expect(el.val()).to.be.equal('');
    });

    it('should remove html tags and leave the text', function () {
        scope.val = '<script>test3</script>';
        scope.$digest();
        expect(el.val()).to.be.equal('test3');
    });

    it('should decode entities and remove tags', function () {
        scope.val = '&lt;script&gt;alert("test4")&lt;/script&gt;';
        scope.$digest();
        expect(el.val()).to.be.equal('alert("test4")');
    });

    it('should decode and remove tags', function () {
        scope.val = '&lt;div&gt;a&amp;b,&apos;c&apos;,&quot;d&quot;&lt;/div&gt;';
        scope.$digest();
        expect(el.val()).to.be.equal('a&b,\'c\',"d"');
    });

});
