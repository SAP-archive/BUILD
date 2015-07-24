'use strict';

var chai = require('norman-testing-tp').chai;
var ControllerBuilder = require('../../lib/services/builder/controllerBuilder.js');
var builderUtils = require('../../lib/services/builder/builderUtils.js');
var fs = require('fs');
var path = require('path');
var expect = chai.expect;

describe('Controller Builder', function () {

    var fakeUICatalog;
    var retrieveTestData = function (testFileName) {
        var testData = {};
        testData.jsonSource = JSON.parse(fs.readFileSync(path.resolve(__dirname, testFileName + '.json')), 'utf-8');
        testData.jsonSource._id = testData.jsonSource.name;
        if (fs.existsSync(path.resolve(__dirname, testFileName + '.xml'))) {
            testData.jsTarget = fs.readFileSync(path.resolve(__dirname, testFileName + '.controller')).toString().replace(/\r\n/g, '\n').replace(/\t/g, '    ');
        }
        return testData;
    };


    describe('knows how to handle events', function () {

        before(function () {
            fakeUICatalog = [JSON.parse(fs.readFileSync(path.resolve(__dirname, './material/r1ui5.json')), 'utf-8'), JSON.parse(fs.readFileSync(path.resolve(__dirname, './material/r1c1ui5.json')), 'utf-8')];
            var appMetadata = {
                catalogId: 'customCatalog',
                navigations: [
                    {
                        routeName: 'SimplePageWithEvent',
                        targetPageId: 'SimplePageWithEvent',
                        targetAggregation: 'pages'
                    }
                ]
            };
            builderUtils.setContext(fakeUICatalog, null, appMetadata);
        });

        it('for simple use case', function () {
            var testData = retrieveTestData('material/events/simplePageWithEvent');
            var generatedController = ControllerBuilder.generateControllerFromMetadata(testData.jsonSource, {
                catalogId: 'customCatalog',
                navigations: [
                    {
                        routeName: 'SimplePageWithEvent',
                        targetPageId: 'SimplePageWithEvent',
                        targetAggregation: 'pages'
                    }
                ]
            }).replace(/\r\n/g, '\n').replace(/\t/g, '    ');
            expect(generatedController).to.equal(testData.jsTarget);
        });

        it('and more complex ones', function () {
            var testData = retrieveTestData('material/events/pageWithChildrenAndEvent');
            var generatedController = ControllerBuilder.generateControllerFromMetadata(testData.jsonSource, {
                catalogId: 'customCatalog',
                navigations: [
                    {
                        routeName: 'SimplePageWithChildrenAndEvent',
                        targetPageId: 'SimplePageWithChildrenAndEvent',
                        targetAggregation: 'pages'
                    }
                ]
            }).replace(/\r\n/g, '\n').replace(/\t/g, '    ');
            expect(generatedController).to.equal(testData.jsTarget);
        });
    });

    describe('but won\'t get fooled if you pass in invalid events', function () {

        before(function () {
            fakeUICatalog = [JSON.parse(fs.readFileSync(path.resolve(__dirname, './material/r1ui5.json')), 'utf-8'), JSON.parse(fs.readFileSync(path.resolve(__dirname, './material/r1c1ui5.json')), 'utf-8')];
            var appMetadata = {catalogId: 'customCatalog'};
            builderUtils.setContext(fakeUICatalog, null, appMetadata);
        });

        it('for simple use case', function () {
            var testData = retrieveTestData('material/events/simplePageWithInvalidEvent');
            var generatedController = ControllerBuilder.generateControllerFromMetadata(testData.jsonSource, {
                catalogId: 'customCatalog',
                navigations: [
                    {
                        routeName: 'SimplePageWithInvalidEvent',
                        targetPageId: 'SimplePageWithInvalidEvent',
                        targetAggregation: 'pages'
                    }
                ]
            }).replace(/\r\n/g, '\n').replace(/\t/g, '    ');
            expect(generatedController).to.equal(testData.jsTarget);
        });
    });

    describe('but won\'t get fooled if you don\'t pass a ui catalog', function () {

        before(function () {
            var appMetadata = {catalogId: 'customCatalog',
                navigations: [
                    {
                        routeName: 'simplePageWithInvalidEventWithoutCatalog',
                        targetPageId: 'simplePageWithInvalidEventWithoutCatalog',
                        targetAggregation: 'pages'
                    }
                ]};
            builderUtils.setContext(null, null, appMetadata);
        });

        it('for simple use case', function () {
            var testData = retrieveTestData('material/events/simplePageWithInvalidEventWithoutCatalog');
            var generatedController = ControllerBuilder.generateControllerFromMetadata(testData.jsonSource, {
                catalogId: 'customCatalog1',
                navigations: [
                    {
                        routeName: 'simplePageWithInvalidEventWithoutCatalog',
                        targetPageId: 'simplePageWithInvalidEventWithoutCatalog',
                        targetAggregation: 'pages'
                    }
                ]
            }).replace(/\r\n/g, '\n').replace(/\t/g, '    ');
            expect(generatedController).to.equal(testData.jsTarget);
        });
    });
});
