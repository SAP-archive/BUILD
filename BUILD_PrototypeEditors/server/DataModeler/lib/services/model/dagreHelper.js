'use strict';

var lodash = require('norman-server-tp').lodash;
var dagre = require('dagre');

var GRAPH_CONFIG = {
	directed: true, // order of nodes in an edge are significant.
	multigraph: true, // allow a graph to have multiple edges between the same pair of nodes.
	compound: true // allow a graph to have compound nodes - nodes which can be the parent of other nodes.
};
var RANK_SEPARATION = 100; // Number of pixels between each rank in the layout.
var NODE_SEPARATION = 30; // Number of pixels that separate nodes horizontally in the layout.
var NODE_WIDTH = 300; // The width of nodes in pixels.
var NODE_HEIGHT = 50; // The height of nodes in pixels.
var MARGIN_X = 100; // Number of pixels to use as a margin around the left and right of the graph.
var MARGIN_Y = 150; // Number of pixels to use as a margin around the top and bottom of the graph.
var DEFAULT_RANK_DIRECTION = 'LR'; // Direction for rank nodes. Can be TB, BT, LR, or RL, where T = top, B = bottom, L = left, and R = right.

function getGraph(entities) {
	var graph = new dagre.graphlib.Graph(GRAPH_CONFIG);

	graph.setGraph({
		rankdir: DEFAULT_RANK_DIRECTION,
		ranksep: RANK_SEPARATION,
		nodesep: NODE_SEPARATION,
		marginx: MARGIN_X,
		marginy: MARGIN_Y
	});

	lodash.forEach(entities, function (oEntity) {
		var node = {item: oEntity, width: NODE_WIDTH, height: NODE_HEIGHT};
		if (oEntity.position.left && oEntity.position.top) {
			node.x = oEntity.position.left;
			node.y = oEntity.position.top;
		}
		graph.setNode(oEntity._id, node);

		lodash.forEach(oEntity.navigationProperties, function (nav) {
			graph.setEdge({
				v: oEntity._id,
				w: nav.toEntityId,
				name: nav.name
			}, (nav.multiplicity) ? {label: 'n'} : {label: '1'});
		});
	});

	dagre.layout(graph);

	return graph;
}

exports.buildGraph = function (context) {
	if (context.model && context.model.entities) {
		var graph = getGraph(context.model.entities);

		lodash.each(graph.nodes(), function (nodeId) {
			var node = graph.node(nodeId);
			var entity = lodash.find(context.model.entities, {_id: nodeId});
			entity.position = {
				left: node.x,
				top: node.y,
				width: node.width,
				height: node.height
			};
		});
	}

	return context;
};
