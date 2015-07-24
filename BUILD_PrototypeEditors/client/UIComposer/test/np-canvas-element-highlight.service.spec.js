'use strict';
(function () {

    var expect = chai.expect;

    describe('Service: np-canvas-element-highlight', function () {
        var $q, $rootScope, npCanvasElementHighlight, npGridPositionMock;

        var controlData = {
            catalogControlName: 'sap_m_Button',
            controlId: 'button_1',
            catalogId: '123'
        };

        var sibling = {
            style: {
                id: 'siblingStyle',
                visibility: {}
            }
        };

        beforeEach(module('uiComposer.uiCanvas'));

        beforeEach(module(function ($provide) {
            npGridPositionMock = {
                getSiblingAtPosition: function () {
                    return sibling;
                }
            };
            $provide.value('npGridPosition', npGridPositionMock);
        }));

        beforeEach(inject(function ($injector) {
            $q = $injector.get('$q');
            $rootScope = $injector.get('$rootScope');
            npCanvasElementHighlight = $injector.get('npCanvasElementHighlight');
        }));

        it('should update the elements highlight and notify others about that update', function () {
            var spy = sinon.spy($rootScope, '$broadcast');
            npCanvasElementHighlight.highlightElementAtPosition(controlData, 0, 0);
            expect(spy.calledWith('elementHighlight/updated')).to.be.equal(true);
            var highlights = npCanvasElementHighlight.getElementHighlights();
            expect(highlights).to.be.an('array');
            expect(highlights.length).to.be.equal(1);
        });

        it('should highlight grid elements if the new control can be dropped into that grid elements aggregation', function () {
            var highlightElement = npCanvasElementHighlight.highlightElementAtPosition(controlData, 0, 0);
            var highlights = npCanvasElementHighlight.getElementHighlights();
            expect(highlights[0].style.id).to.be.equal(sibling.style.id);
            expect(highlightElement).to.be.deep.equal(sibling);
        });

        it('should clear the element highlights on clear', function () {
            npCanvasElementHighlight.highlightElementAtPosition(controlData, 0, 0);
            var highlights = npCanvasElementHighlight.getElementHighlights();
            expect(highlights.length).to.be.equal(1);

            var spy = sinon.spy($rootScope, '$broadcast');
            npCanvasElementHighlight.clearElementHighlights();
            highlights = npCanvasElementHighlight.getElementHighlights();
            expect(highlights.length).to.be.equal(0);
            expect(spy.calledWith('elementHighlight/updated')).to.be.equal(true);
        });
    });
})();
