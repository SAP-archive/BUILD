'use strict';

var chai = require('norman-testing-tp').chai;
var oDataHelper = require('../../lib/services/builder/technology/odataHelper.js');
var builderUtils = require('../../lib/services/builder/builderUtils.js');
var fs = require('fs');
var path = require('path');
var expect = chai.expect;

describe('OData Helper', function () {
    var retrieveVocabulary = function (vocabularyName) {
        return fs.readFileSync(path.resolve(__dirname, '../../lib/services/builder/technology/odata/' + vocabularyName + '.xml')).toString();
    };
    describe('can parse vocabularies', function () {
        it('and return proper type and terms', function () {
            var uiVoc = oDataHelper.parseVocabulary(retrieveVocabulary('UI.vocabularies'));
            expect(uiVoc.Terms.GeoPoints).to.deep.equal({
                AppliesTo: 'EntityType',
                CollectionType: 'Edm.AnnotationPath',
                FullName: 'com.sap.vocabularies.UI.v1.GeoPoints',
                IsCollection: true,
                Name: 'GeoPoints',
                Type: 'Collection(Edm.AnnotationPath)',
                annotations: [
                    'Core.Description',
                    'UI.ThingPerspective'
                ]
            });
        });

        it('and can recognize some parameters', function () {
            var parsedMeasures = oDataHelper.parseVocabulary(retrieveVocabulary('Org.OData.Measures.V1'));
            expect(parsedMeasures).to.be.not.null;
            expect(parsedMeasures.Terms.ISOCurrency.RequireBinding).to.equal('true');
            var parsedCommon = oDataHelper.parseVocabulary(retrieveVocabulary('Common.vocabularies'));
            expect(parsedCommon).to.be.not.null;
            expect(parsedCommon.Terms.Text.RequireBinding).to.equal('true');
        });

    });

    describe('can avoid conflicts', function () {

        beforeEach(function () {
            var fakeDataModel = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'material/virtualDataModel.json')), 'utf-8');
            var fakeLangHelper = {
                isURIType: function () {
                    return true;
                },
                reset: function () {

                }
            };
            var appMetadata = {catalogId: 'customCatalog'};
            builderUtils.setContext(null, fakeDataModel, fakeLangHelper, appMetadata);
        });

        it('when entity names exist', function () {
            var newEntity = oDataHelper.createEntity(); // 'Entity_0' already exists
            expect(newEntity).to.be.not.null;
            expect(newEntity.name === 'Entity_0_0').to.be.true;
        });

        it('when entity names exist', function () {
            var newEntity = oDataHelper.createEntity();  // 'Entity_1' & 'Entity_1_1' already exists
            expect(newEntity).to.be.not.null;
            expect(newEntity.name === 'Entity_1_1_1').to.be.true;
        });

        it('when entity names exist twice', function () {
            var newEntity = oDataHelper.createEntity(); // 'Entity_2' does not exist
            expect(newEntity).to.be.not.null;
            expect(newEntity.name === 'Entity_2').to.be.true;
        });

        it('when property names do not exist', function () {
            var newPropertyName = oDataHelper.createEntityPropertyName('Entity_0', 'OKName'); // does not exist
            expect(newPropertyName === 'OKName').to.be.true;
        });

        it('when property names exist', function () {
            var newPropertyName = oDataHelper.createEntityPropertyName('Entity_0', 'ID'); // 'ID' exists
            expect(newPropertyName === 'ID_1').to.be.true;
        });

        it('when property names exist twice', function () {
            var newPropertyName = oDataHelper.createEntityPropertyName('Entity_1', 'Name'); // 'Name' & 'Name_1' exists
            expect(newPropertyName === 'Name_2').to.be.true;
        });

    });

});
