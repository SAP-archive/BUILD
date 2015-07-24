'use strict';
(function () {

    var expect = chai.expect;

    describe('Service: np-page-map-layout', function () {

        var npPageMapLayout, $httpBackend;
        var page1 = {
            displayName: 'Page 1',
            id: 'cfdbcd9b8412872c09db4ce3',
            name: 'S0',
            pageUrl: '/index.html#S0',
            thumbnailUrl: '/resources/thumbnail/S0.png'
            },
            page2 = {
                displayName: 'Page 2',
                id: 'cfdbcd9b8412872c09db4ce3',
                name: 'S1',
                pageUrl: '/index.html#S1',
                thumbnailUrl: '/resources/thumbnail/S1.png'
            },
            page3 = {
                displayName: 'Page 3',
                id: 'cfdbcd9b8412872c09db4ce3',
                name: 'S2',
                pageUrl: '/index.html#S2',
                thumbnailUrl: '/resources/thumbnail/S2.png'
            },
            page4 = {
                displayName: 'Page 4',
                id: 'cfdbcd9b8412872c09db4ce4',
                name: 'S3',
                pageUrl: '/index.html#S3',
                thumbnailUrl: '/resources/thumbnail/S3.png'
            };
        var pages = [page1, page2, page3, page4];
        var links =
            [{pageFrom: 'S0', pageTo: 'S1'},
                {pageFrom: 'S0', pageTo: 'S2'},
                {pageFrom: 'S1', pageTo: 'S2'},
                {pageFrom: 'S2', pageTo: 'S0'}];

        var npPrototypeMock = {
            setPositionsPageMap: function () {
            }
        };
        beforeEach(module('ngResource'));
        beforeEach(module('pageMapView'));

        beforeEach(module(function ($provide) {
            $provide.value('npPrototype', npPrototypeMock);
            var html = '<div id ="np-p-page-map-layout"></div>';
            var elem = angular.element(html);

            angular.element(document.body).append(elem);
        }));

        beforeEach(function () {
            inject(function ($injector) {
                $httpBackend = $injector.get('$httpBackend');
                npPageMapLayout = $injector.get('npPageMapLayout');
            });
        });

        afterEach(function () {
            var canvasElem = document.getElementById('np-p-page-map-layout');
            canvasElem.parentNode.removeChild(canvasElem);
        });

        describe('Grid Layouting of Pages', function () {

            it('should return the pages with length of the pages', function () {
                var pagesWithInitialPositions = npPageMapLayout.getGridLayout(pages);
                expect(pagesWithInitialPositions.length).to.be.equal(4);
            });

            it('should return the position of the first and second pages with initial position values', function () {
                var pagesWithInitialPositions = npPageMapLayout.getGridLayout(pages);
                expect(pagesWithInitialPositions[0].position.top).to.be.equal('20px');
                expect(pagesWithInitialPositions[0].position.left).to.be.equal('20px');
                expect(pagesWithInitialPositions[1].position.top).to.be.equal('200px');
                expect(pagesWithInitialPositions[1].position.left).to.be.equal('20px');
            });
        });

        describe('Connected and Unconnected Pages', function () {

            it('should return the connected pages', function () {
                var connectedPages = npPageMapLayout.applyFirstOccurenceRuleOnLinks(pages, links).connectedPages;
                expect(connectedPages.length).to.be.equal(3);
            });

            it('should return the unConnected pages', function () {
                var unConnectedPages = npPageMapLayout.applyFirstOccurenceRuleOnLinks(pages, links).unConnectedPages;
                expect(unConnectedPages.length).to.be.equal(1);
            });

        });

        describe('Create Page Map Layout', function () {
            it('should return the pages with d3 tree layout information', function () {
                var values = npPageMapLayout.applyFirstOccurenceRuleOnLinks(pages, links);
                var pagesWithLayoutInfo = npPageMapLayout.createLayout(values.connectedPages, values.edges);
                expect(pagesWithLayoutInfo.length).to.be.equal(3);
                expect(pagesWithLayoutInfo[0].position.top).to.be.equal('90px');
                expect(pagesWithLayoutInfo[0].position.left).to.be.equal('0px');
                expect(pagesWithLayoutInfo[1].position.top).to.be.equal('0px');
                expect(pagesWithLayoutInfo[1].position.left).to.be.equal('220px');
                expect(pagesWithLayoutInfo[2].position.top).to.be.equal('180px');
                expect(pagesWithLayoutInfo[2].position.left).to.be.equal('220px');
            });

            it('should return the height of the layout', function () {
                var values = npPageMapLayout.applyFirstOccurenceRuleOnLinks(pages, links);
                npPageMapLayout.createLayout(values.connectedPages, values.edges);
                expect(document.getElementById('np-p-page-map-layout').style.height).to.be.equal('360px');
            });

            it('should return the pages with d3 tree layout information for two disconnected layouts', function () {
                var edges = [{pageFrom: 'S0', pageTo: 'S1'},
                    {pageFrom: 'S2', pageTo: 'S3'}];
                var values = npPageMapLayout.applyFirstOccurenceRuleOnLinks(pages, edges);
                var pagesWithLayoutInfo = npPageMapLayout.createLayout(values.connectedPages, values.edges);
                expect(pagesWithLayoutInfo.length).to.be.equal(4);
                expect(pagesWithLayoutInfo[0].position.top).to.be.equal('0px');
                expect(pagesWithLayoutInfo[0].position.left).to.be.equal('0px');
                expect(pagesWithLayoutInfo[2].position.top).to.be.equal('0px');
                expect(pagesWithLayoutInfo[2].position.left).to.be.equal('220px');
                expect(pagesWithLayoutInfo[1].position.top).to.be.equal('180px');
                expect(pagesWithLayoutInfo[1].position.left).to.be.equal('0px');
                expect(pagesWithLayoutInfo[3].position.top).to.be.equal('180px');
                expect(pagesWithLayoutInfo[3].position.left).to.be.equal('220px');
            });

            it('should return the height of the layout for multiple layouts', function () {
                var edges = [{pageFrom: 'S0', pageTo: 'S1'},
                    {pageFrom: 'S2', pageTo: 'S3'}];
                var values = npPageMapLayout.applyFirstOccurenceRuleOnLinks(pages, edges);
                npPageMapLayout.createLayout(values.connectedPages, values.edges);
                expect(document.getElementById('np-p-page-map-layout').style.height).to.be.equal('360px');
            });
        });

        describe('Links between Pages', function () {
            it('should return the links after applying the first occurence rule', function () {
                var edges = npPageMapLayout.applyFirstOccurenceRuleOnLinks(pages, links).edges;
                expect(links.length).to.be.equal(4);
                expect(edges.length).to.be.equal(2);
            });

            it('should return all the links from first occurence rule when the pages only have one incoming link', function () {
                var links =
                    [{pageFrom: 'S0', pageTo: 'S1'},
                        {pageFrom: 'S0', pageTo: 'S2'}];
                var edges = npPageMapLayout.applyFirstOccurenceRuleOnLinks(pages, links).edges;
                expect(links.length).to.be.equal(2);
                expect(edges.length).to.be.equal(2);
            });

            it('should not return any links when there are no connections', function () {
                var links = [];
                var edges = npPageMapLayout.applyFirstOccurenceRuleOnLinks(pages, links).edges;
                expect(edges.length).to.be.equal(0);
            });
        });
    });
})();
