'use strict';

var _ = require('norman-client-tp').lodash;

/**
 * @namespace npTreeNodeFactory
 */

/**
 * @typedef TreeNode
 * @type {object}
 * @memberof npTreeNodeFactory
 *
 * @property {number} nodeId
 * @property {number} parentNodeId
 * @property {string} type
 * @property {string} displayName
 * @property {object} data - reference to the object that this tree node instance represents (e.g. page, group, gridElement)
 * @property {boolean} collapsed
 * @property {TreeNode[]} children
 */
var npTreeNodeFactory = ['npUiCatalog', 'uiUtil', 'npGrid', 'npPageMetadata',
    function (npUiCatalog, uiUtil, npGrid, npPageMetadata) {
        /**
         * @name createNode
         * @memberof npTreeNodeFactory
         *
         * @param {object} options
         * @param {TreeNode} [parent]
         * @param {number} [parentIndex=parent.children.length]
         * @returns {TreeNode}
         */
        var createNode = function (options, parent, parentIndex) {
            var type = options && options.type ? options.type : undefined;

            if (_.isUndefined(type) || _.isUndefined(factories[type])) {
                throw new Error('Unsupported tree node type provided. (' + type + ')');
            }

            return factories[type](options, parent, parentIndex);
        };

        /**
         * @private
         * @description Prototype object of all tree nodes.
         */
        var nodeProto = {
            nodeId: '-1',
            parentNodeId: '-1',
            type: '',
            displayName: '',
            data: null,
            collapsed: true,
            children: null,
            select: function () {
            }
        };

        /**
         * @private
         * @description Factory functions for all available node types.
         */
        var factories = {
            node: function (options, parent, parentIndex) {
                var node = Object.create(nodeProto);
                node.nodeId = uiUtil.nextUid();
                if (parent) {
                    node.parentNodeId = parent.nodeId;
                    parentIndex = _.isNumber(parentIndex) ? parentIndex : parent.children.length;
                    parent.children.splice(parentIndex, 0, node);
                }
                node.children = [];
                _.extend(node, options);
                return node;
            },
            page: function (options, parent, parentIndex) {
                var page = options.data;
                options.displayName = options.displayName || page.displayName;
                var node = factories.node(options, parent, parentIndex);
                node.select = function () {
                    npPageMetadata.setCurrentPageName(this.data.name);
                };
                return node;
            },
            group: function (options, parent, parentIndex) {
                var group = options.data;
                options.displayName = options.displayName || group.displayName;
                return factories.node(options, parent, parentIndex);

            },
            gridElement: function (options, parent, parentIndex) {
                var controlMd = options.data.controlMd;
                var diffName = npUiCatalog.getControlDiffName(controlMd.catalogControlName, controlMd.catalogId);
                var value = '';
                if (diffName) {
                    var diffNameValue = _.result(_.find(options.data.controlMd.properties, function (property) {
                        return property.name === diffName;
                    }), 'value');
                    if (diffNameValue) {
                        value = ' ' + diffNameValue;
                    }
                }
                options.displayName = options.displayName || npUiCatalog.getControlDisplayName(controlMd.catalogControlName, controlMd.catalogId) + value;
                var node = factories.node(options, parent, parentIndex);
                node.select = function () {
                    npGrid.setSelectedElements([this.data]);
                };
                return node;
            }
        };

        return {
            createNode: createNode
        };
    }
];

module.exports = npTreeNodeFactory;
