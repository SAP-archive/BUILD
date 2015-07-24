'use strict';

/**
 * @ngdoc directive
 * @name ui.elements:uiPieChart
 *
 * @description
 * Creates pie chart.
 *
 * @restrict E
 * @element ANY
 *
 * @param {string} dataset the object data to be used to create the chart
 *
 * @example

 <doc:example>
    <doc:source>
        <ui-pie-chart dataset=""></ui-pie-chart>
    </doc:source>
 </doc:example>
 *
 */

// @ngInject
module.exports = function ($compile, $timeout) {
    return {
        restrict: 'E',
        replace: true,
        transclude: true,
        scope: {
            valuesSet: '=',
            colorList: '='
        },
        templateUrl: 'resources/angular-sap-ui-elements/ui-elements/ui-pie-chart/pie.template.html',
        controllerAs: 'uiPieCtrl',
        controller: ['$scope', '$element', '$attrs', uiPieController]
    };

    function uiPieController(scope, $element, $attrs) {

        var default_color = ['#19BC9C', '#2ECC71', '#3398DB', '#9B59B6', '#F1C40E', '#FFFCB6', '#E67E22', '#E74C3C', '#BDC3C7', '#ECF0F1', '#95A5A6', '#34485E'];

        function sliceSize(dataNum, dataTotal) {
            return (dataNum / dataTotal) * 360;
        }

        function addSlice(sliceSize, pieElement, offset, sliceID, color) {

            pieElement.append("<div class='slice " + sliceID + "'><span></span></div>");

            var offset = offset - 1;
            var sizeRotation = -179 + sliceSize;

            angular.element(pieElement[0].querySelector("." + sliceID)).css({
                "transform": "rotate(" + offset + "deg) translate3d(0,0,0)",
                "-webkit-transform": "rotate(" + offset + "deg) translate3d(0,0,0)"
            });

            angular.element(pieElement[0].querySelector("." + sliceID + " span")).css({
                "transform": "rotate(" + sizeRotation + "deg) translate3d(0,0,0)",
                "-webkit-transform": "rotate(" + sizeRotation + "deg) translate3d(0,0,0)",
                "background-color": color
            });
        }

        function iterateSlices(sliceSize, pieElement, offset, dataCount, sliceCount, color) {
            var sliceID = "s" + dataCount + "-" + sliceCount;
            var maxSize = 179;
            if (sliceSize <= maxSize) {
                addSlice(sliceSize, pieElement, offset, sliceID, color);
            } else {
                addSlice(maxSize, pieElement, offset, sliceID, color);
                iterateSlices(sliceSize - maxSize, pieElement, offset + maxSize, dataCount, sliceCount + 1, color);
            }
        }

        function createPie(pieElement, data, color) {
            var listData = data;
            var listTotal = 0;
            var j = 0;
            var k = 1;
            var l = default_color.length;
            var ll = default_color.length;

            for (var i = 0; i < listData.length; i++) {
                listTotal += listData[i];
            }

            var offset = 0;
            if (typeof color === 'undefined') {
                color = [];
                for (var i = 0; i < data.length; i++) {
                    if (i >= l) {
                        j = 0;
                        k++;
                        l = ll * k;
                    } else {
                        if (k > 1) {
                            j = l - i;
                        } else {
                            j = i;
                        }
                    }
                    color.push(default_color[j]);
                }
            }

            for (var i = 0; i < listData.length; i++) {
                var size = sliceSize(listData[i], listTotal);
                if (size && size !== 0) {
                    iterateSlices(size, pieElement, offset, i, 0, color[i]);
                    offset += size;
                }
            }
        }

        if ($attrs.small !== undefined) {
            angular.element($element).addClass('small');
        }

       var waitAndCreate = function(){
            $timeout(function () {
                if (typeof scope.valuesSet !== "undefined") {
                    createPie($element, scope.valuesSet, scope.colorList);
                }
            });
        }

        scope.$watch('valuesSet',waitAndCreate);

        scope.$on('$destroy', function () {
            $element.detach();
        });
    }
};
