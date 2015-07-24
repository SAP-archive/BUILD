'use strict';

describe('Unit tests for UserResearch utils', function () {
    var util,
        testUrl = 'https://mail.example.com/study/123456789/question/EXAMPLE',
        relativeUrl = '/study/123456789/question';

    beforeEach(module('UserResearch'));
    beforeEach(module('common.ui.elements'));
    beforeEach(module('UserResearch.utils'));
    beforeEach(module('shell.aside'));
    beforeEach(module('shell.dashboard'));
    beforeEach(module('shell.projectLandingPage'));


    beforeEach(inject(function (urUtil) {
        util = urUtil;
    }));

    // editUrlParameter
    it('Url should update and return full path (with value at end)', function () {
        expect(util.editUrlParameter(testUrl, 'question', 'NEW_VALUE', true))
            .to.be.equal('https://mail.example.com/study/123456789/question/NEW_VALUE');
    });

    it('Url should update and return full path (with value in the middle)', function () {
        expect(util.editUrlParameter(testUrl + '/more/and/more', 'question', 'NEW_VALUE', true))
            .to.be.equal('https://mail.example.com/study/123456789/question/NEW_VALUE/more/and/more');
    });

    it('Url should update and return relative path (with param = false)', function () {
        expect(util.editUrlParameter(testUrl, 'question', 'NEW_VALUE', false))
            .to.be.equal('/study/123456789/question/NEW_VALUE');
    });

    it('Url should update and return relative path (with param not given)', function () {
        expect(util.editUrlParameter(testUrl, 'question', 'NEW_VALUE'))
            .to.be.equal('/study/123456789/question/NEW_VALUE');
    });

    it('Url should throw error for un-found parameter', function () {
        expect(function () {
            util.editUrlParameter(testUrl, 'unfoundparameter', 'NEW_VALUE', true);
        })
        .to.throw(Error, /Cannot find parameter because the key is not present in the given URL/);
    });

    it('Url should throw error for un-found value', function () {
        testUrl = 'https://mail.example.com/study/123456789/question';
        expect(function () {
            util.editUrlParameter(testUrl, 'question', 'NEW_VALUE', true);
        })
        .to.throw(Error, /Cannot replace \'value\' because the URL contained no initial value/);
    });

    it('Url should throw error for key type error', function () {
        expect(function () {
            util.editUrlParameter(testUrl, 123, 'NEW_VALUE', true);
        })
        .to.throw(Error, /Cannot find parameter because the key is not a String/);
    });

    // compareURIs
    it('Url should match itself', function () {
        expect(util.compareURIs(testUrl, testUrl)).to.be.equal(true);
    });

    it('Url should match itself with extra "/"s', function () {
        expect(util.compareURIs(testUrl, testUrl + '/')).to.be.equal(true);
    });

    it('Url should match itself with extra #s', function () {
        expect(util.compareURIs(testUrl, testUrl + '#')).to.be.equal(true);
    });

    it('Url should match itself with extra "/"s and #s', function () {
        expect(util.compareURIs(testUrl, testUrl + '/' + '#')).to.be.equal(true);
    });

    it('Url should match itself with extra spaces or %20s', function () {
        expect(util.compareURIs(testUrl + '/test test#', testUrl + '/test%20test#')).to.be.equal(true);
    });

    it('Url should match not match a different url', function () {
        expect(util.compareURIs(testUrl, testUrl + '/different#test')).to.be.equal(false);
    });

    // getRelativeURI
    it('should return a relative url given a full url', function () {
        expect(util.getRelativeURI(testUrl)).to.be.equal('/study/123456789/question');
    });

    // getRelativeURI - with boolean
    it('should return a object containing pathname and hash', function () {
        var parsed = util.getRelativeURI(testUrl, true);
        expect(parsed.pathname).to.be.equal('/study/123456789/question');
        expect(parsed.hash).to.be.equal('');
    });

    it('should return itself given a relative url', function () {
        expect(util.getRelativeURI(relativeUrl)).to.be.equal(relativeUrl);
    });

    // textCountValidation
    it('should return the new max length of string that accounts for newline characters', function () {
        var egText = 'text with \n\n 2 newlines';
        expect(egText.length).to.be.equal(23);
        var text = util.textCountValidation('text with \n\n 2 newlines', 30);
        expect(text.max).to.be.equal(32);
        expect(text.remaining).to.be.equal(7);
    });

    // shortenText
    it('should return qId of the question that matches the given relative url', function () {
        expect(util.shortenText('This is quite a long sentence, not really.', 10)).to.be.equal('This is ...');
        expect(util.shortenText('This is quite a long sentence, not really.', 20)).to.be.equal('This is quite a ...');
        expect(util.shortenText('This is quite a long sentence, not really.', 30)).to.be.equal('This is quite a long ...');
        expect(util.shortenText('This is quite a long sentence, not really.', 40)).to.be.equal('This is quite a long sentence, not ...');
        expect(util.shortenText('This is quite a long sentence, not really.', 50)).to.be.equal('This is quite a long sentence, not really.');
    });

    // getContextFromUrl
    it('should get SmartApp context from hash of URL', function () {
        var testHash = '#/SalesOrder(\'pears\')';
        var context = util.getContextFromUrl(testHash, 'UI5');
        expect(context.context_type).to.equal('UI5');
        expect(context.entity).to.equal('SalesOrder');
        expect(context.data).to.equal('pears');
    });

    // clearFileUploadProgress
    it('should broadcast "clear-file-upload-progress" event with list of file sequence numbers to remove',
        inject(function ($rootScope) {
            var scope = $rootScope.$new();
            var files = [{name: 'fileA', sequence: '0'}, {name: 'fileB', sequence: '1'}];
            var spy = sinon.spy(scope, '$broadcast');
            util.clearFileUploadProgress(scope, files);
            spy.should.have.been.calledWith('clear-file-upload-progress', ['0', '1']);
        }));

    // clearFileUploadProgress - negative
    it('should not broadcast "clear-file-upload-progress" event when list of files is null or undefined',
        inject(function ($rootScope) {
            var scope = $rootScope.$new();
            var spy = sinon.spy(scope, '$broadcast');
            util.clearFileUploadProgress(scope, null);
            spy.should.not.have.been.called;
            util.clearFileUploadProgress(scope, undefined);
            spy.should.not.have.been.called;
        }));
});
