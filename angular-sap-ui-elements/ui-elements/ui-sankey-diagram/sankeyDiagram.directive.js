'use strict';

/**
 * @ngdoc directive
 * @name ui.elements:uiSankeyDiagram
 *
 * @description Creates a Sankey Diagram.
 *
 * @restrict E
 * @element ANY
 *
 * @param {Object}
 *            data Node and link data
 * @param {Object}
 *            domain svg container width,height,top,bottom,left and right data
 * @param {String}
 *            container-id DOM element where svg has to be appended
 * @param {number}
 *            link-opacity opacity of link colors
 * @param {function}
 *            onMouseOver mouse over call back handlers for node & link
 * @param {function}
 *            onMouseOut mouse out call back handlers for node & link
 * @param {function}
 *            onClick on-click call back handlers for node & link
 * @param {String}
 *            node-Align possible values: steps / endPoints. If nodes have to be
 *            displayed based on user steps/levels or nodes without outgoing
 *            links should be aligned farthest.
 * 
 * @param {String}
 *        nodePadding for nodes
 * 
 * @param {String}
 *         nodeWidth for nodes
 * 
 */
var d3 = require('d3-browserify');
var sankey = require('angular-sap-d3-plugins/sankey/sankey');
// @ngInject
module.exports = function() {
	return {

		templateUrl : 'resources/angular-sap-ui-elements/ui-elements/ui-sankey-diagram/sankeyDiagram.template.html',
		restrict : 'E',
		scope : {
			data : '=',
			domain : '=',
			onMouseOver : '&',
			onMouseOut : '&',
			onClick : '&'
		},
		replace : true,
		transclude : true,
		link : function(scope, element, attrs) {
			var graph = scope.data,
			 containerId = '#' + attrs.containerId,
			 margin = scope.domain, width = margin.width, height = margin.height,
			 nodeWidth= 150,
			 nodePadding = 80,
			relativePath = location.pathname;


            // allows users to specify their own nodeWidth and nodePadding
            var parsed;
            if(attrs.nodeWidth !== undefined){
                parsed = parseInt(attrs.nodeWidth);
                if(typeof parsed === 'number'){
                    nodeWidth = parsed;
                }
            }
           
           if(attrs.nodePadding !== undefined){
                parsed = parseInt(attrs.nodePadding);
                if(typeof parsed === 'number'){
                    nodePadding = parsed;
                }
            }

			// append the svg canvas to the page
			var svg = d3.select(containerId).append('svg').attr('width',
					width).attr('height',
					height).attr('overflow','visible').append('g').attr(
					'transform', 'translate(' + 0 + ',' + 56 + ')');

			var sankeyGen = sankey(d3,attrs.nodeAlign).nodeWidth(nodeWidth).nodePadding(
					nodePadding).size([ width-20, height - 20 ]);

			var path = sankeyGen.link();
			sankeyGen.nodes(graph.nodes).links(graph.links).layout(32);

			// add in the links
			svg.append('g').selectAll('.link').data(graph.links)
					.enter().append('path').attr('stroke', function(d) {
						// if user has specified the color display it, else
						// return shamrock
						if(d.hasOwnProperty('color'))
							return d.color;
						else
							return '#2ECC71';
					}).attr('d', path).attr('fill', 'none').attr(
							'stroke-opacity', attrs.linkOpacity).style(
							'stroke-width', function(d) {
								return Math.max(1, d.value);
							}).attr('class','link').on('mouseover',onMouseOver).on('mouseout',onMouseOut).on('click',onMouseClick);

			// add in the nodes
			var node = svg.append('g').selectAll('.node').data(graph.nodes)
					.enter().append('g').attr('class', 'node').attr(
							'transform', function(d) {
								return 'translate(' + d.x + ',' + d.y + ')';
							}).on('mouseover',onMouseOver).on('mouseout',onMouseOut).on('click',onMouseClick);
			// add images for the nodes
			node.append('defs').append('pattern').attr('id', function(d, i) {
				return attrs.containerId + i;
			}).attr('patternUnits', 'objectBoundingBox').attr('width', '100%')
					.attr('height', '100%').append('svg:image').attr(
							'xlink:href', function(d) {
								return d.image;
							}).attr('height', 102).attr('width',140).
							attr('x',5).attr('y',5).attr('preserveAspectRatio',
							'none');

			node.append('rect').attr('y',-56).attr('height', 112).attr('width',
					150).style({
					'fill':
					function(d, i) {
						var data = relativePath + '#'
								+ attrs.containerId + i;

						return 'url(' + data + ')';
					}, 'stroke':'#DBDFE1','stroke-width':'1px solid'});

			// add the target if any for the nodes
			node.append('rect').filter(function(d){
				if(d.isTarget) return true;
				else return false;
			}).attr('x',10).attr('y',45).attr('height',20).attr('width',130).attr('fill','#e74c3c');
			node.append('text').filter(function(d){
				if(d.isTarget) return true;
				else return false;
			}).attr('x', function() {
				return 75;
			}).attr('y', function() {
				return 60;
			}).attr('text-anchor', 'middle').attr('transform', null).style('fill',
					'white').attr('font-weight','bold').text(function(d) {
				if(d.isTarget)
				return 'Target';
			});
			// add in the text for the nodes
			node.append('text').attr('x', function() {
				return 75;
			}).attr('y', function() {
				return 80;
			}).attr('text-anchor', 'middle').attr('transform', null).style('fill',
					'#2c3e50').attr('font-weight','bold').text(function(d) {
				return d.name;
			});
            
            
            /**
             * Allows consuming control to broadcast re-render event
             * enabling the sankey canvas to adopt the height and width of the
             * sankey diagram generated.
             */
            scope.$on('sankey-rerender', function(){
                if(svg[0] && svg[0][0]){
                    var svgElement = document.getElementsByTagName('svg')[0];
                    var child = svg[0][0];
                    var cHeight = child.getBoundingClientRect().height;
                    var cWidth = child.getBoundingClientRect().width;
                    svgElement.setAttribute('height', cHeight);
                    svgElement.setAttribute('width', cWidth);
                }
            });
            
            
			// on mouse over
			function onMouseOver(d) {
				var callback=scope.onMouseOver();
				if(callback){
					var data={'data':d};
					callback(data);
				}
			}
			// on mouse out
			function onMouseOut() {
				var callback=scope.onMouseOut();
				if(callback){
					callback();
				}
			}
			// on click
			function onMouseClick(d) {
				var callback=scope.onClick();
				if(callback){
					var data={'data':d};
					callback(data);
				}
			}
		}

	};
};
