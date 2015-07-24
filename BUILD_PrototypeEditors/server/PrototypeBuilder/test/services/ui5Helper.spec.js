'use strict';

var chai = require('norman-testing-tp').chai;
var sinon = require('norman-testing-tp').sinon;
var viewHelper = require('../../lib/services/builder/technology/ui5Helper.js');
var builderUtils = require('../../lib/services/builder/builderUtils.js');
var fs = require('fs');
var path = require('path');
var expect = chai.expect;

describe('UI5 Helper', function () {
    var viewName = 'MyView';

    before(function (done) {
        viewHelper.initialize(done);
    });

    beforeEach(function () {
        viewHelper.reset();
    });

    describe('provides multiple utilities', function () {
        it('and can get the controller name', function () {
            expect(viewHelper.getControllerName(viewName)).to.equal('generated.app.view.MyView');
        });

        it('and get rootElement for the XML', function () {
            expect(viewHelper.getRootElement({name: viewName})).to.deep.equal({
                'mvc:View': {
                    '@xmlns:mvc': 'sap.ui.core.mvc',
                    '@controllerName': 'generated.app.view.MyView'
                }
            });
        });

        it('and extract control information', function () {
            var controlInformation = viewHelper.extractControlInformation('sap_m_Page');
            expect(controlInformation.namespaceObject.namespaceValue).to.equal('sap.m');
            expect(controlInformation.namespaceObject.prefix).to.equal('m');
            expect(controlInformation.namespaceObject.qualifiedNamespace).to.equal('xmlns:m');
            expect(controlInformation.controlName).to.equal('Page');
            expect(controlInformation.prefixedControlName).to.equal('m:Page');
        });

        it('and extract control information twice', function () {
            var controlInformation = viewHelper.extractControlInformation('sap_m_Page');
            expect(controlInformation.namespaceObject.namespaceValue).to.equal('sap.m');
            expect(controlInformation.namespaceObject.prefix).to.equal('m');
            expect(controlInformation.namespaceObject.qualifiedNamespace).to.equal('xmlns:m');
            expect(controlInformation.controlName).to.equal('Page');
            expect(controlInformation.prefixedControlName).to.equal('m:Page');

            controlInformation = viewHelper.extractControlInformation('sap_m_Page');
            expect(controlInformation.namespaceObject.namespaceValue).to.equal('sap.m');
            expect(controlInformation.namespaceObject.prefix).to.equal('m');
            expect(controlInformation.namespaceObject.qualifiedNamespace).to.equal('xmlns:m');
            expect(controlInformation.controlName).to.equal('Page');
            expect(controlInformation.prefixedControlName).to.equal('m:Page');
        });

        it('and extract slightly more complex control information', function () {
            var controlInformation = viewHelper.extractControlInformation('sap_ui_core_mvc_XMLView');
            expect(controlInformation.namespaceObject.namespaceValue).to.equal('sap.ui.core.mvc');
            expect(controlInformation.namespaceObject.prefix).to.equal('mvc');
            expect(controlInformation.namespaceObject.qualifiedNamespace).to.equal('xmlns:mvc');
            expect(controlInformation.controlName).to.equal('XMLView');
            expect(controlInformation.prefixedControlName).to.equal('mvc:XMLView');
        });
    });

    describe('can work with binding', function () {
        var retrievePropertyStub;
        var retrieveEntityStub;
        beforeEach(function () {
            retrievePropertyStub = sinon.stub(builderUtils, 'retrievePropertyName');
            retrievePropertyStub.returns('Amount');
            retrieveEntityStub = sinon.stub(builderUtils, 'retrieveEntityName');
            retrieveEntityStub.withArgs('Entity1', false).returns('SalesOrder');
            retrieveEntityStub.withArgs('Entity1', undefined).returns('SalesOrder');
            retrieveEntityStub.withArgs('Entity1', true).returns('SalesOrderSet');

        });

        afterEach(function () {
            retrievePropertyStub.restore();
            retrieveEntityStub.restore();
        });

        it('and can generate a property binding path', function () {
            var bindingInfo = {isRelative: true, paths: [{entityId: 'Entity1', propertyId: 'Property1'}]};
            expect(viewHelper.preparePropertyBindingPath(bindingInfo)).to.equal('{Amount}');
        });

        it('and can generate a list binding path', function () {
            var bindingInfo = {isRelative: true, paths: [{entityId: 'Entity1', propertyId: 'Property1'}]};
            expect(viewHelper.prepareListBindingPath(bindingInfo)).to.equal('{Amount}');
        });

        it('and can generate absolute property binding path', function () {
            var bindingInfo = {isRelative: false, paths: [{entityId: 'Entity1', propertyId: 'Property1'}]};
            expect(viewHelper.preparePropertyBindingPath(bindingInfo)).to.equal('{/SalesOrderSet/Amount}');
        });

        it('and can generate absolute list binding path', function () {
            var bindingInfo = {isRelative: false, paths: [{entityId: 'Entity1', propertyId: 'NavProp1'}]};
            expect(viewHelper.prepareListBindingPath(bindingInfo)).to.equal('{/SalesOrderSet/Amount}');
        });
        it('and can generate absolute list binding path', function () {
            var bindingInfo1 = {isRelative: false, paths: [{entityId: 'Entity1', propertyId: ''}]};
            expect(viewHelper.prepareListBindingPath(bindingInfo1)).to.equal('{/SalesOrderSet}');
            var bindingInfo2 = {isRelative: false, paths: [{entityId: 'Entity1'}]};
            expect(viewHelper.prepareListBindingPath(bindingInfo2)).to.equal('{/SalesOrderSet}');
        });
    });

    describe('can generate an event handler name', function () {
        it('work for simple case', function () {
            expect(viewHelper.getEventHandlerName({eventId: 'MyEvent'}, 'MyControl')).to.equal('_onMyEventMyControl');
            expect(viewHelper.getEventHandlerName({eventId: 'MyEvent'}, 'MyControl67')).to.equal('_onMyEventMyControl67');
        });
        it('also support weird IDs', function () {
            expect(viewHelper.getEventHandlerName({eventId: 'MyEvent'}, 'My-Control')).to.equal('_onMyEventMy_Control');
            expect(viewHelper.getEventHandlerName({eventId: 'MyEvent'}, 'My@-Control')).to.equal('_onMyEventMy__Control');
        });

    });

    describe('can generate index html', function () {
        var retrievePageMetadata = function (testFileName) {
            return JSON.parse(fs.readFileSync(path.resolve(__dirname, testFileName + '.json')), 'utf-8');
        };
        it('for simple page', function () {
            var pageMetadata = retrievePageMetadata('material/properties/simplePage');
            var sampleIndex = fs.readFileSync(path.resolve(__dirname, 'material/ui5/sampleIndex.html')).toString();
            expect(viewHelper.generateIndex([pageMetadata], '/sapui5/resources/sap-ui-core.js')).to.equal(sampleIndex);
        });
        it('for simple page in snapshot', function () {
            var pageMetadata = retrievePageMetadata('material/properties/simplePage');
            var sampleIndex = fs.readFileSync(path.resolve(__dirname, 'material/ui5/sampleIndexSnapshot.html')).toString();
            expect(viewHelper.generateIndex([pageMetadata], '/sapui5/resources/sap-ui-core.js', true)).to.equal(sampleIndex);
        });
    });

    describe('can generate router', function () {
        var retrievePageMetadata = function (testFileName) {
            return JSON.parse(fs.readFileSync(path.resolve(__dirname, testFileName + '.json')), 'utf-8');
        };
        var pageMetadata;
        before(function () {
            var fakeUICatalog = [JSON.parse(fs.readFileSync(path.resolve(__dirname, './material/r1ui5.json')), 'utf-8'), JSON.parse(fs.readFileSync(path.resolve(__dirname, './material/r1c1ui5.json')), 'utf-8')];
            pageMetadata = retrievePageMetadata('material/properties/simplePage');

            var appMetadata = {
                catalogId: 'customCatalog',
                appType: 'App',
                pages: [pageMetadata],
                navigations: [
                    {
                        routeName: 'SimplePage',
                        targetPageId: 'SimplePage',
                        targetAggregation: 'pages'
                    }
                ]
            };
            builderUtils.setContext(fakeUICatalog, null, appMetadata);
        });
        it('for simple page', function () {
            var sampleRouter = fs.readFileSync(path.resolve(__dirname, 'material/ui5/sampleRouter.js.tmpl')).toString().replace(/\r\n/g, '\n').replace(/\t/g, '    ');
            expect(viewHelper.generateRouter({
                pages: [pageMetadata],
                navigations: [
                    {
                        routeName: 'SimplePage',
                        targetPageId: 'SimplePage',
                        targetAggregation: 'pages'
                    }
                ]
            }).replace(/\r\n/g, '\n').replace(/\t/g, '    ')).to.equal(sampleRouter);
        });
    });

    describe('can generate ComponentPreload bundle', function () {
        it('for simple xml view', function () {
            var artifactsToBundle = [
                {
                    path: 'view/S0.view.xml',
                    filecontent: '<my>XML</my>'
                }
            ];
            var bundleContent = viewHelper.generateBundle(artifactsToBundle);
            var expBundle = 'jQuery.sap.registerPreloadedModules({\n' +
                '    version: \'2.0\',\n' +
                '    name: \'generated/app/Component-preload\',\n' +
                '    modules: {"generated/app/view/S0.view.xml":"<my>XML</my>"}\n' +
                '});';
            expect(bundleContent).to.equal(expBundle);
        });

        it('for more content', function () {
            var artifactsToBundle = [
                {
                    path: 'view/S0.view.xml',
                    filecontent: '<my>XML</my>'
                },
                {
                    path: 'view/S0.controller.js',
                    filecontent: '"use strict";' +
                    'sap.ui.controller("sap.generated.view.S0",{' +
                    '   onInit: function() {' +
                    '       this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);' +
                    '       this.oRouter.attachRouteMatched(jQuery.proxy(this.handleRouteMatched, this));' +
                    '   }' +
                    '});'
                }
            ];
            var bundleContent = viewHelper.generateBundle(artifactsToBundle);
            var expBundle = 'jQuery.sap.registerPreloadedModules({\n' +
                '    version: \'2.0\',\n' +
                '    name: \'generated/app/Component-preload\',\n' +
                '    modules: {"generated/app/view/S0.view.xml":"<my>XML</my>","generated/app/view/S0.controller.js":"\\\"use strict\\\";' +
                'sap.ui.controller(\\\"sap.generated.view.S0\\\",{' +
                '   onInit: function() {' +
                '       this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);' +
                '       this.oRouter.attachRouteMatched(jQuery.proxy(this.handleRouteMatched, this));' +
                '   }' +
                '});' +
                '"}\n});'
            expect(bundleContent).to.equal(expBundle);
        });
    });

    describe('can escape properties', function () {
        it('won\'t change good properties', function () {
            expect(viewHelper.escapePropertyValue('User')).to.equal('User');
            expect(viewHelper.escapePropertyValue('Vegetables')).to.equal('Vegetables');
            expect(viewHelper.escapePropertyValue('Don\'t do stuff')).to.equal('Don\'t do stuff');
            expect(viewHelper.escapePropertyValue('日本語で')).to.equal('日本語で');
        });
        it('will escape bindings', function () {
            expect(viewHelper.escapePropertyValue('{User}')).to.equal('\\{User\\}');
            expect(viewHelper.escapePropertyValue('{Morpha\'l}')).to.equal('\\{Morpha\'l\\}');
        });
        it('will not be too evil', function () {
            expect(viewHelper.escapePropertyValue('User}')).to.equal('User}');
            expect(viewHelper.escapePropertyValue('{Morpha\'l')).to.equal('{Morpha\'l');
        });
    });
});
