'use strict';

var chai = require('norman-testing-tp').chai;
var ViewBuilder = require('../../lib/services/builder/viewBuilder.js');
var builderUtils = require('../../lib/services/builder/builderUtils.js');
var fs = require('fs');
var path = require('path');
var expect = chai.expect;

describe('View Builder', function () {

    var uiCatalogs;
    var dataModel;
    var retrieveTestData = function (testFileName) {
        var testData = {};
        testData.jsonSource = JSON.parse(fs.readFileSync(path.resolve(__dirname, testFileName + '.json')), 'utf-8');
        if (fs.existsSync(path.resolve(__dirname, testFileName + '.xml'))) {
            testData.xmlTarget = fs.readFileSync(path.resolve(__dirname, testFileName + '.xml')).toString().replace(/\r\n/g, '\n').replace(/\t/g, '    ');
        }
        return testData;
    };

    before(function () {
        uiCatalogs = [JSON.parse(fs.readFileSync(path.resolve(__dirname, './material/r1ui5.json')), 'utf-8'), JSON.parse(fs.readFileSync(path.resolve(__dirname, './material/r1c1ui5.json')), 'utf-8')];
        dataModel = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'material/sampleDataModel.json')), 'utf-8');
        builderUtils.setContext(uiCatalogs, dataModel, {catalogId: 'customCatalog'});
    });

    describe('knows how to deal with property', function () {
        it('in a simple use case', function () {
            var testData = retrieveTestData('material/properties/simplePage');
            var generatedXML = ViewBuilder.generatePageFromMetadata(testData.jsonSource);
            expect(generatedXML).to.equal(testData.xmlTarget);
        });

        it('and also when there are invalid properties', function () {
            var testData = retrieveTestData('material/properties/simplePageWithInvalidProperty');
            var generatedXML = ViewBuilder.generatePageFromMetadata(testData.jsonSource);
            expect(generatedXML).to.equal(testData.xmlTarget);
        });

        it('and also when there are null properties', function () {
            var testData = retrieveTestData('material/properties/simplePageWithNullProperty');
            var generatedXML = ViewBuilder.generatePageFromMetadata(testData.jsonSource);
            expect(generatedXML).to.equal(testData.xmlTarget);
        });

        it('and also how to deal with custom controls', function () {
            var testData = retrieveTestData('material/properties/simplePageWithCustomControl');
            var generatedXML = ViewBuilder.generatePageFromMetadata(testData.jsonSource);
            expect(generatedXML).to.equal(testData.xmlTarget);
        });
    });

    describe('knows how to handle groups', function () {

        it('by supporting nested controls', function () {
            var testData = retrieveTestData('material/groups/pageWithChildren');
            var generatedXML = ViewBuilder.generatePageFromMetadata(testData.jsonSource);
            expect(generatedXML).to.equal(testData.xmlTarget);
        });

        it('by supporting namespace issue #12', function () {
            var testData = retrieveTestData('material/groups/pageWithChildrenInSimilarNamespace');
            var generatedXML = ViewBuilder.generatePageFromMetadata(testData.jsonSource);
            expect(generatedXML).to.equal(testData.xmlTarget);
        });

        it('by avoiding incorrect groups', function () {
            var testData = retrieveTestData('material/groups/pageWithInvalidChildren');
            var generatedXML = ViewBuilder.generatePageFromMetadata(testData.jsonSource);
            expect(generatedXML).to.equal(testData.xmlTarget);
        });

        it('and deeply nested controls', function () {
            var testData = retrieveTestData('material/groups/pageWithDeepChildren');
            var generatedXML = ViewBuilder.generatePageFromMetadata(testData.jsonSource);
            expect(generatedXML).to.equal(testData.xmlTarget);
        });
    });

    describe('knows how to handle events', function () {

        it('for simple use case', function () {
            var testData = retrieveTestData('material/events/simplePageWithEvent');
            var generatedXML = ViewBuilder.generatePageFromMetadata(testData.jsonSource);
            expect(generatedXML).to.equal(testData.xmlTarget);
        });

        it('and generate coherent event name', function () {
            var testData = retrieveTestData('material/events/pageWithChildrenAndEvent');
            var generatedXML = ViewBuilder.generatePageFromMetadata(testData.jsonSource);
            expect(generatedXML).to.equal(testData.xmlTarget);
        });

        it('for simple invalid use case', function () {
            var testData = retrieveTestData('material/events/simplePageWithInvalidEvent');
            var generatedXML = ViewBuilder.generatePageFromMetadata(testData.jsonSource);
            expect(generatedXML).to.equal(testData.xmlTarget);
        });
    });

    describe('knows how to handle incorrect template', function () {
        it('for incorrect controlId', function () {
            var testData = retrieveTestData('material/errors/invalidControlId');
            try {
                var generatedXML = ViewBuilder.generatePageFromMetadata(testData.jsonSource);
                expect(generatedXML).to.be.null;
            }
            catch (err) {
                expect(err).to.be.not.null;
            }
        });
    });

    describe('knows how to handle bindings', function () {

        it('for dateBindings', function () {
            var testData = retrieveTestData('material/bindings/dateBinding');
            var generatedXML = ViewBuilder.generatePageFromMetadata(testData.jsonSource);
            expect(generatedXML).to.equal(testData.xmlTarget);
        });

        it('for propertyBindings', function () {
            var testData = retrieveTestData('material/bindings/propertyBinding');
            var generatedXML = ViewBuilder.generatePageFromMetadata(testData.jsonSource);
            expect(generatedXML).to.equal(testData.xmlTarget);
        });

        it('for multiple propertyBindings', function () {
            var testData = retrieveTestData('material/bindings/multiplePropertyBinding');
            var generatedXML = ViewBuilder.generatePageFromMetadata(testData.jsonSource);
            expect(generatedXML).to.equal(testData.xmlTarget);
        });

        it('for invalid propertyBindings', function () {
            var testData = retrieveTestData('material/bindings/invalidPropertyBinding');
            var generatedXML = ViewBuilder.generatePageFromMetadata(testData.jsonSource);
            expect(generatedXML).to.equal(testData.xmlTarget);
        });

        it('for listBindings', function () {
            var testData = retrieveTestData('material/bindings/listBinding');
            var generatedXML = ViewBuilder.generatePageFromMetadata(testData.jsonSource);
            expect(generatedXML).to.equal(testData.xmlTarget);
        });

        it('for absolute listBindings', function () {
            var testData = retrieveTestData('material/bindings/listBindingAbsolute');
            var generatedXML = ViewBuilder.generatePageFromMetadata(testData.jsonSource);
            expect(generatedXML).to.equal(testData.xmlTarget);
        });

        it('for invalid listBindings', function () {
            var testData = retrieveTestData('material/bindings/invalidListBinding');
            var generatedXML = ViewBuilder.generatePageFromMetadata(testData.jsonSource);
            expect(generatedXML).to.equal(testData.xmlTarget);
        });

        it('for mixed property bindings', function () {
            var testData = retrieveTestData('material/bindings/mixedBindings');
            var generatedXML = ViewBuilder.generatePageFromMetadata(testData.jsonSource);
            expect(generatedXML).to.equal(testData.xmlTarget);
        });

        it('for list binding with expand', function () {
            var testData = retrieveTestData('material/bindings/listBindingWithExpand');
            var generatedXML = ViewBuilder.generatePageFromMetadata(testData.jsonSource);
            expect(generatedXML).to.equal(testData.xmlTarget);
        });

    });
});
