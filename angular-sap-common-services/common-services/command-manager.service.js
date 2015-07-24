'use strict';

var _ = require('lodash');

/**
 * @ngdoc factory
 * @name uiCommandManager
 * @namespace common.services:uiCommandManager
 *
 * @description
 * Command manager service that can be leveraged for undo-redo operations.
 */

/**
 * @typedef Command
 * @type {object}
 * @memberof common.services:uiCommandManager
 *
 * @property {function() | function()[]} execute Command function or array of functions to execute.
 * @property {function() | function()[]} unexecute Command function or array of functions that does/do the reverse of execute.
 * @property {function()} [preaction] Function to execute before command is executed/unexecuted.
 * @property {function()} [postaction] Function to execute after command was executed/unexecuted.
 */

var uiCommandManager = ['$rootScope', '$q', '$log', '$state', 'ActiveProjectService',
    function uiCommandManager($rootScope, $q, $log, $state, ActiveProjectService) {
        var self = {};
        self._undoStack = [];
        self._redoStack = [];

        $rootScope.$watch(function() {
            return ActiveProjectService.id;
        }, function() {
            self._undoStack = [];
            self._redoStack = [];
        });

        /**
         * @name execute
         * @memberof common.services:uiCommandManager
         * @description Execute a new command and push it onto the undo stack if it executed successfully. Clears the redo stack.
         *
         * @param {Command} command Command object to execute.
         * @param {boolean} [combineWithPrevious=false] Wether command object should be merged with previous one. Undo will
         * then unexecute both commands. This will overwrite previous command's pre- and postaction with the newly provided ones.
         * @returns {Promise} Promise that is resolved with the execute function's result once the command has executed.
         */
        self.execute = function(command, combineWithPrevious) {
            command = sanitizeCommand(command);
            if (!command.execute.length || !command.unexecute.length) {
                return $q.reject(new Error('Unable to execute command. Functions to execute or unexecute were not provided.'));
            }
            return applyCommand(command, command.execute)
                .then(function(res) {
                    if (combineWithPrevious && self._undoStack.length) {
                        command = mergeCommands(self._undoStack.pop(), command);
                    }
                    self._undoStack.push(command);
                    self._redoStack = [];
                    return res;
                });
        };

        /**
         * @private
         * @description Add defaults for pre- and postaction if not provided. Make execute and unexecute arrays.
         *
         * @param {Command} command
         * @returns {Command}
         */
        var sanitizeCommand = function(command) {
            command._state = {
                'name': $state.current.name,
                'params': _.clone($state.params)
            };
            if (!_.isFunction(command.preaction)) {
                command.preaction = $q.when;
            }
            if (!_.isFunction(command.postaction)) {
                command.postaction = $q.when;
            }
            command.execute = _.compact(_.flatten([command.execute]));
            command.unexecute = _.compact(_.flatten([command.unexecute]));
            return command;
        };

        /**
         * @private
         * @description Applies the command with specified actions.
         *
         * @param {Command} command
         * @param {function()[]} actions Reference to either command's execute or unexecute functions.
         * @returns {Promise} Promise that is resolved with the last actions return value when command has finished executing.
         * Promise is rejected if either one of preaction, actions or postaction is rejected.
         */
        var applyCommand = function(command, actions) {
            var result,
                p = $q.when();
            if (!$state.is(command._state.name)) {
                p = $state.go(command._state.name, command._state.params);
            }
            return p
                .then(command.preaction)
                .then(function(res) {
                    p = $q.when(actions[0](res));
                    _.forEach(actions.slice(1), function(action) {
                        p = p.then(action);
                    });
                    return p;
                })
                .then(function(res) {
                    result = res;
                    return command.postaction();
                })
                .then(function() {
                    return result;
                })
                .catch(function(err) {
                    $log.error('Applying command failed with error: ', err);
                    return $q.reject(err);
                });
        };

        /**
         * @private
         * @description Merges two command objects into a single one.
         *
         * @param {Command} c1
         * @param {Command} c2
         * @returns {Command} Command with c2's pre- and postaction and c1's and c2's execute/unexecute function arrays concatenated together.
         */
        var mergeCommands = function(c1, c2) {
            c1.preaction = c2.preaction;
            c1.postaction = c2.postaction;
            c1.execute = c1.execute.concat(c2.execute);
            c1.unexecute = c2.unexecute.concat(c1.unexecute);
            return c1;
        };

        /**
         * @name undo
         * @memberof common.services:uiCommandManager
         * @description Undo last executed command.
         *
         * @returns {Promise} Promise that is resolved once last executed command was unexecuted.
         */
        self.undo = function() {
            var lastCommand = self._undoStack.pop();
            if (lastCommand) {
                self._redoStack.push(lastCommand);
                return applyCommand(lastCommand, lastCommand.unexecute);
            }
        };

        /**
         * @name hasUndoCommands
         *
         * @returns {boolean} Wether undoable actions are available.
         */
        self.hasUndoCommands = function() {
            return self._undoStack.length > 0;
        };

        /**
         * @name redo
         * @memberof common.services:uiCommandManager
         * @description Undo last undo command.
         *
         * @returns {Promise} Promise that is resolved once last undone command was executed again.
         */
        self.redo = function() {
            var lastUndo = self._redoStack.pop();
            if (lastUndo) {
                self._undoStack.push(lastUndo);
                return applyCommand(lastUndo, lastUndo.execute);
            }
        };

        /**
         * @name hasRedoCommands
         *
         * @returns {boolean} Wether redoable actions are available.
         */
        self.hasRedoCommands = function() {
            return self._redoStack.length > 0;
        };

        return self;
    }
];

module.exports = uiCommandManager;
