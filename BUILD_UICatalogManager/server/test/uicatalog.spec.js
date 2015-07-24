'use strict';
var chai = require('norman-testing-tp').chai;
var expect = chai.expect;
var commonServer = require('norman-common-server');

var path = require('path');

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var config = 'config.json';

console.log('Starting in mode: ' + process.env.NODE_ENV);

var configFile = path.join(__dirname, config);
var appServer = require('node-sap-app-server');
var k, n;
for (k = 2, n = process.argv.length; k < n; ++k) {
    if ((process.argv[k] === "--config") && (k < n - 1)) {
        configFile = process.argv[k + 1];
    }
}

function testFailed(done) {
    return function (err) {
        done(err || new Error('Test failed'));
    };
}

var appServerStarted = appServer.Server.start(configFile);

describe('UICatalog', function () {
	
    it('Get all catalogs', function (done) {
        appServerStarted.then(function () {
            var UICatalogService = commonServer.registry.getModule('UICatalog');
            UICatalogService.getCatalogs()
                .then(function (result) {  			
                    expect(result.length).equal(3);
                    done();
                }, testFailed(done));
        });
    });

    it('Get lib types', function (done) {
        appServerStarted.then(function () {
            var UICatalogService = commonServer.registry.getModule('UICatalog');
            UICatalogService.getLibraryTypes()
                .then(function (result) { 				
                    expect(result.length).equal(3);
                    done();
                }, testFailed(done));
        });
    });
    

    it('Get actions', function (done) {
        appServerStarted.then(function () {
            var UICatalogService = commonServer.registry.getModule('UICatalog');
            UICatalogService.getActions('sample ui catalog','1.26.6')
                .then(function (result) { 		
									
                    expect(result[0].Actions.length).equal(3);
                    done();
                }, testFailed(done));
        });
    });
    it('Get action by id', function (done) {
        appServerStarted.then(function () {
            var UICatalogService = commonServer.registry.getModule('UICatalog');
            UICatalogService.getAction('sample ui catalog','NAVTO')
                .then(function (result) {  
								
                   expect(result.Actions[0].actionName).equal("Navigation");
                    done();
                }, testFailed(done));
        });
    });
    it('Get catalog by name and version', function (done) {
        appServerStarted.then(function () {
            var UICatalogService = commonServer.registry.getModule('UICatalog');
            UICatalogService.getCatalog('sample ui catalog','1.26.6')
                .then(function (result) {     	
                    expect(result.name).equal('sample ui catalog');
					 expect(result.catalogVersion).equal("1.26.6");
                    done();
                }, testFailed(done));
        });
    });
    it('Get floor plan by name', function (done) {
        appServerStarted.then(function () {
            var UICatalogService = commonServer.registry.getModule('UICatalog');
            UICatalogService.getFloorPlanByName('ABSOLUTE')
                .then(function (result) {                
                    expect(result.length).equal(1);
                    done();
                }, testFailed(done));
        });
    });
    it('Get floor plan by library type', function (done) {
        appServerStarted.then(function () {
            var UICatalogService = commonServer.registry.getModule('UICatalog');
            UICatalogService.getFloorPlanByLibType('openui5')
                .then(function (result) {                
                    expect(result.length).equal(1);
                    done();
                }, testFailed(done));
        });
    });
    it('activate ui5', function (done) {
        appServerStarted.then(function () {
            var UICatalogService = commonServer.registry.getModule('UICatalog');
            UICatalogService.activateCatalog('sample ui catalog','1.26.6','openui5')
                .then(function (result) {      
                    expect(result.active).equal(true);
                    done();
                }, testFailed(done));
        });
    });
    it('download angular template', function (done) {
        appServerStarted.then(function () {
            var UICatalogService = commonServer.registry.getModule('UICatalog');
            UICatalogService.downloadCatalogs([{name:'sample angular catalog',catalogVersion:'0.1',libraryType:'angular'}])
                .then(function (result) {                
                    expect(result.length).equal(1);
                    done();
                }, testFailed(done));
        });
    });
	
    it('Delete catalog', function (done) {
        appServerStarted.then(function () {
            var UICatalogService = commonServer.registry.getModule('UICatalog');
            UICatalogService.deleteCatalog('sample ui catalog','1.26.6')
                .then(function (result) {  
                    expect(result).equal(1);
                    done();
                }, testFailed(done));
        });
    });
   it('Delete all catalog', function (done) {
        appServerStarted.then(function () {
            var UICatalogService = commonServer.registry.getModule('UICatalog');
            UICatalogService.deleteCatalogs([{name:'sample angular catalog',catalogVersion:'0.1',libraryType:'angular'}])
                .then(function (result) {                
                    expect(result).equal(1);
                    done();
                }, testFailed(done));
        });
    });
});