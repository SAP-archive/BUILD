'use strict';

var fs = require('fs');
var path = require('path');
var chai = require('norman-testing-tp').chai;
var builderUtils = require('../../lib/services/builder/builderUtils.js');
var expect = chai.expect;

describe('Builder Utils', function () {

    describe('knows how to work with bindings', function () {
        beforeEach(function () {
            var fakeDataModel = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'material/sampleDataModel.json')), 'utf-8');
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

        it('and can retrieve a propertyName from binding information', function () {
            expect(builderUtils.retrievePropertyName('Entity1', 'Prop1')).to.equal('ID');
            expect(builderUtils.propertyCache['Entity1:Prop1']).to.equal('ID');
            expect(builderUtils.retrievePropertyName('Entity2', 'Prop2')).to.equal('Description');
            expect(builderUtils.retrievePropertyType('Entity1', 'Prop4')).to.equal('DateTime');
            expect(builderUtils.propertyCache['Entity1:Prop4:Type']).to.equal('DateTime');
        });

        it('and will return null in case of a wrong entity or property', function () {
            expect(builderUtils.retrievePropertyName('Entity1', 'PropX')).to.be.null;
            expect(builderUtils.retrievePropertyName('EntityY', 'Prop2')).to.be.null;
            expect(builderUtils.retrievePropertyType('Entity1', 'PropX')).to.be.null;
            expect(builderUtils.retrievePropertyType('EntityY', 'Prop2')).to.be.null;
        });

        it('and can retrieve an entityName from binding information', function () {
            expect(builderUtils.retrieveEntityName('Entity1')).to.equal('SalesOrder');
            expect(builderUtils.entityCache['Entity1:false']).to.equal('SalesOrder');
            expect(builderUtils.retrieveEntityName('Entity2')).to.equal('Product');
        });

        it('and will return null in case of a wrong entity', function () {
            expect(builderUtils.retrievePropertyName('EntityY')).to.be.null;
            expect(builderUtils.retrieveEntityName('EntityY')).to.be.null;
            expect(builderUtils.retrievePropertyType('EntityY')).to.be.null;
        });
    });

    describe('will fail bindings if the data model is unknown', function () {
        beforeEach(function () {
            var fakeLangHelper = {
                reset: function () {
                }
            };
            builderUtils.setContext(null, null, fakeLangHelper, {catalogId: 'customCatalog'});
        });

        it('and can retrieve a propertyName from binding information', function () {
            expect(builderUtils.retrievePropertyName('Entity1', 'Prop1')).to.be.null;
            expect(builderUtils.propertyCache['Entity1:Prop1']).to.equal(undefined);
            expect(builderUtils.retrievePropertyName('Entity2', 'Prop2')).to.be.null;
        });

        it('and can retrieve an entityName from binding information', function () {
            expect(builderUtils.retrieveEntityName('Entity1')).to.be.null;
            expect(builderUtils.entityCache.Entity1).to.equal(undefined);
            expect(builderUtils.retrieveEntityName('Entity2')).to.be.null;
        });

    });

    describe('knows how to work with ui Catalog', function () {
        var controlData = {
            controlId: 'MyControl',
            parentControlId: null,
            catalogControlName: 'sap_mytest_MyControlCustom',
            catalogId: 'customCatalog'
        };
        var notMyControlData = {
            controlId: 'NotMyControl',
            parentControlId: null,
            catalogControlName: 'sap_test_NotMyControl',
            catalogId: 'customCatalog'
        };

        var fakeUICatalog;
        before(function () {
            fakeUICatalog = [JSON.parse(fs.readFileSync(path.resolve(__dirname, './material/r1ui5.json')), 'utf-8'), JSON.parse(fs.readFileSync(path.resolve(__dirname, './material/r1c1ui5.json')), 'utf-8')];
            var appMetadata = {catalogId: 'customCatalog'};
            builderUtils.setContext(fakeUICatalog, null, appMetadata);
        });

        it('and can find the root catalog', function () {
            expect(builderUtils.getRootCatalog('customCatalog').catalogName).to.equal('openui5r1');
            expect(builderUtils.getRootCatalog('rootCatalog').catalogName).to.equal('openui5r1');
            expect(builderUtils.getRootCatalog('noCatalog')).to.equal(undefined);
        });

        it('and can handle wrong control Definition', function () {
            expect(builderUtils.isControlValid(notMyControlData)).to.be.false;
            expect(builderUtils.isPropertyValid({name: 'myValidProperty'}, notMyControlData)).to.be.false;
            expect(builderUtils.isGroupValid('myValidProperty', notMyControlData)).to.be.false;
            expect(builderUtils.isEventValid('myValidEvent', notMyControlData)).to.be.false;
        });

        it('and can check if a property is valid or not', function () {
            expect(builderUtils.isPropertyValid({name: 'myValidProperty'}, controlData)).to.be.true;
            expect(builderUtils.isPropertyValid('myInvalidProperty', controlData)).to.be.false;
        });

        it('and can check if a group is valid or not', function () {
            expect(builderUtils.isGroupValid('myValidGroup', controlData)).to.be.true;
            expect(builderUtils.isGroupValid('myInvalidGroup', controlData)).to.be.false;
        });

        it('and can check if an event is valid or not', function () {
            expect(builderUtils.isEventValid('myValidEvent', controlData)).to.be.true;
            expect(builderUtils.isEventValid('myInvalidEvent', controlData)).to.be.false;
        });

        it('and can modify an asset value properly if a property is valid or not', function () {
            var assetToCopy = [];
            var property = {
                name: 'myURIProperty',
                value: '/api/projects/d3ba4bc8b593da0009ae0b9f/document/54eb4221df562d9aa035aef7/1/render'
            };
            expect(builderUtils.isPropertyValid(property, controlData, assetToCopy)).to.be.true;
            expect(assetToCopy.length).to.equal(1);
            expect(property.value).equal('assets/54eb4221df562d9aa035aef7');
        });

        it('and can find the uiLang', function () {
            expect(builderUtils.getUiLang('customCatalog')).to.equal('openui5');
            expect(builderUtils.getUiLang('rootCatalog')).to.equal('openui5');
            expect(builderUtils.getUiLang('noCatalog')).to.equal(undefined);
        });
    });

    describe('will not fail even if we are missing a catalog', function () {
        var controlData = {
            controlId: 'MyControl',
            parentControlId: null,
            catalogControlName: 'sap_test_MyControl',
            catalogId: 'customCatalog'
        };
        var notMyControlData = {
            controlId: 'NotMyControl',
            parentControlId: null,
            catalogControlName: 'sap_test_NotMyControl',
            catalogId: 'customCatalog'
        };
        beforeEach(function () {
            var fakeLangHelper = {
                reset: function () {
                }
            };
            var appMetadata = {catalogId: 'customCatalog'};
            builderUtils.setContext(null, null, fakeLangHelper, appMetadata);
        });

        it('and nobody is wrong anymore', function () {
            expect(builderUtils.isControlValid(notMyControlData)).to.be.true;
            expect(builderUtils.isPropertyValid('myValidProperty', notMyControlData)).to.be.true;
            expect(builderUtils.isGroupValid('myValidProperty', notMyControlData)).to.be.true;
            expect(builderUtils.isEventValid('myValidEvent', notMyControlData)).to.be.true;
        });

        it('and can check if a property is valid or not', function () {
            expect(builderUtils.isPropertyValid('myValidProperty', controlData)).to.be.true;
            expect(builderUtils.isPropertyValid('myInvalidProperty', controlData)).to.be.true;
        });

        it('and can check if a group is valid or not', function () {
            expect(builderUtils.isGroupValid('myValidGroup', controlData)).to.be.true;
            expect(builderUtils.isGroupValid('myInvalidGroup', controlData)).to.be.true;
        });

        it('and can check if an event is valid or not', function () {
            expect(builderUtils.isEventValid('myValidEvent', controlData)).to.be.true;
            expect(builderUtils.isEventValid('myInvalidEvent', controlData)).to.be.true;
        });
    });

    describe('can parse asset URL', function () {
        it('can handle default URL', function () {
            var testURL = '/api/projects/d3ba4bc8b593da0009ae0b9f/document/54eb4221df562d9aa035aef7/1/render';
            var assetToCopy = [];
            expect(builderUtils.replaceAssetUrl(testURL, assetToCopy)).to.equal('assets/54eb4221df562d9aa035aef7');
            expect(assetToCopy.length).to.equal(1);
            expect(assetToCopy[0]).to.deep.equal({
                id: '54eb4221df562d9aa035aef7',
                workspacePath: 'assets/54eb4221df562d9aa035aef7',
                version: '1'
            });
        });

        it('can leave alone other URL', function () {
            var testURL = '/api/rototo.png';
            var assetToCopy = [];
            expect(builderUtils.replaceAssetUrl(testURL, assetToCopy)).to.equal('/api/rototo.png');
            expect(assetToCopy.length).to.equal(0);
        });
    });


    describe('knows how to work with data model', function () {
        beforeEach(function () {
            var fakeDataModel = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'material/sampleDataModel.json')), 'utf-8');
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

        it('and work with entity names', function () {
            var entity = builderUtils.getEntityByName('SalesOrder');
            expect(entity.name === 'SalesOrder').to.be.true;  // should get correct entity
            expect(builderUtils.getEntityByName('Entity1')).to.be.undefined; // should not use _id
            expect(builderUtils.getEntityByName('NoSuchEntityName')).to.be.undefined; // does not exist
        });

        it('and work with property names', function () {
            expect(builderUtils.hasPropertyName('SalesOrder', 'ID')).to.be.true; // has property
            expect(builderUtils.hasPropertyName('SalesOrder', 'NoSuchPropertyName')).to.be.false; // does not have property
            expect(builderUtils.hasPropertyName('NoSuchEntityName', 'NoSuchPropertyName')).to.be.false; // no entity exists
        });
    });



    describe('can insert floorplan controls', function () {
        beforeEach(function () {
            var fakeUICatalogs = [JSON.parse(fs.readFileSync(path.resolve(__dirname, './material/r1ui5.json')), 'utf-8'), JSON.parse(fs.readFileSync(path.resolve(__dirname, './material/r1c1ui5.json')), 'utf-8')];
            builderUtils.setContext(fakeUICatalogs, null, {catalogId: 'customCatalog'});
        });
        it('can insert floorplan controls in empty page', function () {
            var pageMd = JSON.parse(fs.readFileSync(path.resolve(__dirname, './material/pageMd0.json')), 'utf-8'),
                pageMdAfter = JSON.parse(fs.readFileSync(path.resolve(__dirname, './material/pageMd0-ABSOLUTE.json')), 'utf-8');
            builderUtils.insertFloorplanControls(pageMd);
            expect(pageMd).to.deep.equal(pageMdAfter);
        });
        it('can insert floorplan controls in page with content', function () {
            var pageMd = JSON.parse(fs.readFileSync(path.resolve(__dirname, './material/pageMd1.json')), 'utf-8'),
                pageMdAfter = JSON.parse(fs.readFileSync(path.resolve(__dirname, './material/pageMd1-ABSOLUTE.json')), 'utf-8');
            builderUtils.insertFloorplanControls(pageMd);
            expect(pageMd).to.deep.equal(pageMdAfter);
        });
    });
});
