'use strict';

var npPageEdge = ['npJsPlumb', '$log', '$timeout',
    function (npJsPlumb, $log, $timeout) {
        return {
            scope: {
                srcId: '@',
                destId: '@',
                id: '@'
            },
            restrict: 'E',
            link: function (scope, element) {
                var instance = npJsPlumb.instance;

                instance.setContainer(element.parent());

                function connectPages() {
                    $timeout(function () {
                        var src = scope.srcId, dest = scope.destId, name = scope.id;
                        var connection = npJsPlumb.getConnection(src, dest, name);
                        if (connection.length) {
                            return;
                        }
                        scope.conn = instance.connect({
                            source: src,
                            target: dest,
                            name: name
                        });
                        if (scope.conn) {
                            scope.conn.setParameter('connId', name);
                        }
                    }, 200);
                }

                connectPages();

            }
        };
    }

];
module.exports = npPageEdge;
