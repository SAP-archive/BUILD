'use strict';
var _ = require('norman-client-tp').lodash;

/**
 * The npUi5Helper service provides a set of apis to deal with manipulation of sapui5 controls.
 * It assumes the main ui technology for the current app is ui5, and provides handlers to deal with control creation/manipulation and technology mashup.
 * @namespace npUi5Helper
 */

/**
 * @typedef {Object} UIControl
 * @memberof npUi5Helper
 * @description UIControl is a ui5 object representing a ui element
 */

/**
 * @typedef {string} CSSSize
 * @memberof npUi5Helper
 * @description string that represents a css size (e.g. 100px, 100%, auto, inherit, 100rem...)
 */

/**
 * @typedef {Object} BindingInfo
 * @memberof npUi5Helper
 * @description object control binding info. it returns the sapui5 binding info, ensuring these properties are set
 * @param {string} path
 * @param {string} expandPaths
 * @param {UIControl} template
 */


var npUi5Helper = ['$q', '$log', '$timeout', 'npLayoutHelper',
    function ($q, $log, $timeout, npLayoutHelper) {
        var win = null;
        var that = this;
        var positionContainerType = 'sap.ui.commons.layout.PositionContainer';

        /**
         * @name setWindow
         * @memberof npUi5Helper
         * @description sets the window currently observed by the service.
         * @returns {Object} promise that will be resolved after the ui is rendered and the app available
         */
        var setWindow = function (w) {
            win = w;
            var deferred = $q.defer();
            if (!w) {
                $log.info('setting window to undefined');
                deferred.resolve();
            }
            else {
                coreReady()
                    .then(function () {
                        // only now is safe to get ui area
                        return waitForRendering(getRootUIArea());
                    })
                    .then(function () {
                        if (getApp()) {
                            deferred.resolve();
                        }
                        else {
                            deferred.reject('no app found');
                        }
                    })
                    .catch(deferred.reject);
            }
            return deferred.promise.catch(function (err) {
                $log.error('could not set window', err);
            });
        };

        /**
         * @name coreReady
         * @memberof npUi5Helper
         * @description
         * Waits until UI5 libraries have been loaded and resolves then the returned promise
         * {@link https://openui5.hana.ondemand.com/docs/guide/91f1e3626f4d1014b6dd926db0e91070.html}
         * @returns {Object} promise that will be resolved after the UI5 libraries have been loaded
         */
        var coreReady = function () {
            var deferred = $q.defer();
            var core = win ? win.sap.ui.getCore() : undefined;
            if (!core) {
                deferred.reject('cannot find core');
            }
            else {
                core.attachInit(deferred.resolve);
                wait(2000).then(deferred.reject);
            }

            return deferred.promise.catch(function (err) {
                $log.error('could not wait for core ready', err);
            });
        };

        /**
         * @name getWindow
         * @memberof npUi5Helper
         * @description
         * returns the window currently observed by the service.
         * @returns {Object} window
         */
        var getWindow = function () {
            return win;
        };

        var getSmartConfiguration = function () {
            var config = {};
            var root = getRootUIArea();
            if (root) {
                if (getControlType(root) === 'sap.m.Shell') {
                    root = root.getApp();
                }
                var componentInstance = root.getComponentInstance();

                if (componentInstance.getMetadata().getParent().getName() === 'sap.ui.generic.app.AppComponent') {
                    config = componentInstance.getMetadata().getManifest()['sap.ui.generic.app'];
                }
            }
            return config;
        };

        /**
         * @name getRootUIArea
         * @memberof npUi5Helper
         * @description the root control (for most of ui5 apps it will be the sap.Shell or ComponentContainer).
         * @returns {UIControl | undefined} rootControl
         */
        var getRootUIArea = function () {
            if (!win || !win.sap) {
                return undefined;
            }
            var rootArea = win.document.querySelector('[data-sap-ui-area]');
            if (rootArea) {
                return win.sap.ui.getCore().getUIArea(rootArea).getRootControl();
            }
        };
        /**
         * @name waitForRendering
         * @memberof npUi5Helper
         * @description Will wait for the control rendering and resolve the promise. The promise is immediately resolved if a control doesn't have a renderer, or if it has already finished rendering.
         * @param {UIControl} control
         * @returns {Promise} promise containing the control
         */
        var waitForRendering = function (control) {
            var deferred = $q.defer();
            if (!win || !win.sap || !isControl(control)) {
                deferred.reject('waitForRendering: window.sap not defined or control not passed');
            }
            // should have a renderer and also a parent
            else if (hasRenderer(control) && control.getParent()) {
                // check if control needs to be rerendered at all, if not just resolve
                var uiArea = control.getUIArea() || {},
                    invalidCtrls = uiArea.mInvalidatedControls || {};
                // if the control is not invalid
                if (control.getDomRef() && !invalidCtrls[control.sId]) {
                    deferred.resolve(control);
                }
                else {
                    var evtDelegate = {
                        onAfterRendering: function () {
                            $log.info('waitForRendering done:', control.sId);
                            control.removeEventDelegate(evtDelegate);
                            deferred.resolve(control);
                        }
                    };
                    control.addEventDelegate(evtDelegate);
                    wait(300).then(function () {
                        deferred.reject('waitForRendering: stopped waiting for control ' + control.sId);
                    });
                }
            }
            else {
                $log.info('waitForRendering: doesn\'t have a renderer or parent', control.sId);
                deferred.resolve(control);
            }
            return deferred.promise
                .catch(function (err) {
                    $log.error(err, control);
                });
        };

        /**
         * @name waitForBinding
         * @memberof npUi5Helper
         * @description Will wait for the control binding and resolve the promise. The promise is immediately resolved if a control doesn't have a binding.
         * @param {UIControl} control
         * @param {bindingName} bindingName
         * @returns {Promise} promise containing the control
         */
        var waitForBinding = function (control, bindingName) {
            if (!win || !win.sap || !isControl(control) || !bindingName) {
                $log.error('waitForBinding: window.sap not defined or control or bindingName not passed', control, bindingName);
                return $q.reject('waitForBinding: window.sap not defined or control or bindingName not passed');
            }

            var bindingInfo = getBindingInfo(control, bindingName) || {},
                binding = bindingInfo.binding;

            // first wait to receive data, then for eventual rendering
            return waitForDataReceived(control, binding).then(waitForRendering);
        };


        /**
         * @name waitForDataReceived
         * @private
         * @description Will wait for the data to be received. Promise rejected after 1000ms
         * @param {UIControl} control
         * @param {string} bindingName
         * @returns {Promise} promise containing the control
         */
        var waitForDataReceived = function (control, binding) {
            var deferred = $q.defer();
            var isListBinding = getControlType(binding) === 'sap.ui.model.odata.ODataListBinding';
            // Only ODataListBinding has a property bPendingRequest (ODataContextBinding has no such property)
            if (!binding || (!binding.bPendingRequest && isListBinding)) {
                deferred.resolve(control);
            }
            else {
                $log.info('waitForDataReceived: start waiting', control.sId);
                var fnDataReceived = function () {
                    $log.info('waitForDataReceived: received data', control.sId);
                    binding.detachDataReceived(fnDataReceived);
                    deferred.resolve(control);
                };
                binding.attachDataReceived(fnDataReceived);

                wait(2000).then(function () {
                    deferred.reject('waitForDataReceived: didn\'t receive data.');
                });
            }

            return deferred.promise
                .catch(function (err) {
                    $log.error(err, control, binding);
                })
                // needed because ui5 uses a timeout after the data is received
                .then(function () {
                    return wait(5);
                })
                .then(function () {
                    return waitForRendering(control);
                });
        };

        var wait = function (ms) {
            return $timeout(function () {
                $log.info('timeout expired', ms);
            }, ms, false);
        };

        /**
         * @name getId
         * @memberof npUi5Helper
         * @description returns the id of control
         * @param {UIControl} control
         * @returns {string} control id
         */
        var getId = function (control) {
            var sId = control && control.getId ? control.getId() : '';
            if (sId.indexOf('--') >= 0) {
                sId = sId.substr(sId.lastIndexOf('--') + 2);
            }
            if (sId.length) {
                return sId;
            }
        };
        /**
         * @name getDomRef
         * @memberof npUi5Helper
         * @description returns the dom object corresponding to a control
         * @param {UIControl} control
         * @returns {HTMLElement} control dom ref
         */
        var getDomRef = function (control) {
            if (control && typeof control.getDomRef === 'function') {
                return control.getDomRef();
            }
        };
        /**
         * @name getControlProperty
         * @memberof npUi5Helper
         * @description gets the control property value, taking care if it is a mashup control or not.
         * @param {UIControl} control
         * @param {string} propertyName
         * @returns {Object} propertyValue
         */
        var getControlProperty = function (control, propertyName) {
            var propertyValue;
            // normal case, exclude mashup controls
            if (!isMashupControl(control)) {
                var propertyMd = control.getMetadata().getAllProperties()[propertyName];
                if (!propertyMd) {
                    $log.error(propertyName + ' property not available for control ' + control.sId);
                }
                else {
                    propertyValue = control.getProperty(propertyName);
                }
            }
            // for mashup controls, special handling to get the property
            else {
                var $content = win.jQuery(control.getContent());
                if (propertyName === 'innerText') {
                    propertyValue = $content.text();
                }
                else {
                    propertyValue = $content.attr(propertyName);
                }
            }
            return propertyValue;
        };


        /**
         * @name setControlProperty
         * @memberof npUi5Helper
         * @description sets the control property value, taking care if it is a mashup control or not.
         * @param {UIControl} control
         * @param {string} propertyName
         * @param {string} propertyValue
         * @returns {setControlProperty} npUi5Helper, for chaining
         */
        var setControlProperty = function (control, propertyName, propertyValue) {
            var propMd = control.getMetadata().getAllProperties()[propertyName];
            // for mashup controls we have to generate content again (only for properties not present in control metadata itself
            if (isMashupControl(control) && !propMd) {
                var $content = win.jQuery(control.getContent());
                if (propertyName === 'innerText') {
                    $content.text(propertyValue);
                }
                else {
                    // objects must be strings to be put in HTML attributes
                    if (typeof propertyValue === 'object') {
                        // stringify json and replace " with '
                        propertyValue = JSON.stringify(propertyValue).replace(/"/g, '\'');
                    }
                    $content.attr(propertyName, propertyValue);
                }
                propertyName = 'content';
                propertyValue = $content.outerHTML();
                propMd = control.getMetadata().getAllProperties()[propertyName];
            }

            if (propMd) {
                unbindProperty(control, propertyName);

                var sMutator = propMd._sMutator || 'set' + _.capitalize(propertyName);
                if (control[sMutator]) {
                    control[sMutator](propertyValue);
                }
                else {
                    control.setProperty(propertyName, propertyValue);
                }

            }
            else {
                $log.error(propertyName + ' property can\'t be set for control ' + control.sId);
            }
            return that;
        };

        /**
         * @name getBindingInfo
         * @memberof npUi5Helper
         * @description returns the binding info of a control property/aggregation, if it is bound
         * @param {UIControl} ctrl
         * @param {string} name (property or aggregation)
         * @returns {BindingInfo|undefined}
         */
        var getBindingInfo = function (ctrl, name) {
            if (isMashupControl(ctrl)) {
                return undefined;
            }
            var info = ctrl.getBindingInfo(name);
            if (!_.isEmpty(info)) {
                info.path = info.path || ctrl.getBindingPath(name);
                info.expandPaths = _.isEmpty(info.mParameters) ? null : info.mParameters.expand;
            }
            return info;
        };

        /**
         * @name getCurrentViewBindingInfo
         * @private
         * @description returns the binding info of the current view
         * @returns {BindingInfo|undefined} binding info
         */
        var getCurrentViewBindingInfo = function () {
            var view = getCurrentView();
            if (!view) {
                return undefined;
            }
            var info = view.getObjectBinding();
            if (!_.isEmpty(info)) {
                info.path = info.path || info.getPath();
                info.expandPaths = _.isEmpty(info.mParameters) ? undefined : info.mParameters.expand;
            }
            return info;
        };

        var bindAggregation = function (control, aggregationName, path, template, expandPaths) {
            unbindAggregation(control, aggregationName);
            if (path && template) {
                var bindingInfo = {
                    path: path,
                    template: template,
                    parameters: {expand: expandPaths || ''}
                };
                control.bindAggregation(aggregationName, bindingInfo);
            }
        };

        var unbindAggregation = function (control, aggregationName) {
            if (control.isBound(aggregationName)) {
                control.unbindAggregation(aggregationName);
            }
        };

        var updateAggregation = function (control, aggregationName) {
            control.updateAggregation(aggregationName);
        };

        var bindProperty = function (control, propertyName, path) {
            unbindProperty(control, propertyName);
            if (path) {
                control.bindProperty(propertyName, path);
            }
        };
        var unbindProperty = function (control, propertyName) {
            if (control.isBound(propertyName)) {
                control.unbindProperty(propertyName);
            }
        };

        /**
         * @name getCurrentView
         * @private
         * @returns {Object} The current view
         */
        var getCurrentView = function () {
            var app = getApp();
            if (app) {
                var currentContent = app.getCurrentPage(isMasterPage());
                if (currentContent != null && getControlType(currentContent) === 'sap.ui.core.ComponentContainer') {
                    currentContent = currentContent.getComponentInstance().getAggregation('rootControl');
                }
                return currentContent;
            }
        };

        /**
         * @name getCurrentViewName
         * @memberof npUi5Helper
         * @description The current view's base name. Strips all path information.
         * @returns {string} The current view's base name.
         */
        var getCurrentViewName = function () {
            var currentViewName = getCurrentView().getViewName();
            return currentViewName.slice(_.lastIndexOf(currentViewName, '.') + 1);
        };

        var getApp = function () {
            return findControlBySelector('.sapMNav');
        };

        var findControlBySelector = function (selector) {
            var root = getRootUIArea();
            if (root && selector) {
                var ctrlId = root.$().find(selector).attr('id');
                return win.sap.ui.getCore().byId(ctrlId);
            }
        };

        var getRouter = function () {
            var root = getRootUIArea();
            if (root) {
                if (getControlType(root) === 'sap.m.Shell') {
                    root = root.getApp();
                }
                return root.getComponentInstance().getRouter();
            }
        };

        var getMockServer = function () {
            var root = getRootUIArea();
            if (root) {
                if (getControlType(root) === 'sap.m.Shell') {
                    root = root.getApp();
                }
                return root.getComponentInstance().getMockServer();
            }
        };

        var getAttachMethod = function (attach) {
            var methodName;
            if (isMasterPage()) {
                methodName = 'AfterMasterNavigate';
            }
            else if (isDetailPage()) {
                methodName = 'AfterDetailNavigate';
            }
            else {
                methodName = 'AfterNavigate';
            }

            var prefix = (attach) ? 'attach' : 'detach';
            methodName = prefix + methodName;

            return methodName;
        };

        var navTo = function (routeName) {
            var deferred = $q.defer();
            if (win) {
                var currentView = getCurrentView();

                // if already in the page, resolve
                if (currentView && currentView.getViewName().endsWith(routeName)) {
                    deferred.resolve();
                }
                // else wait for navigation
                else {
                    var app = getApp(),
                        fnAfterNavigate = function () {
                            deferred.resolve();
                            app[getAttachMethod(false)](fnAfterNavigate);
                        };

                    app[getAttachMethod(true)](fnAfterNavigate);

                    wait(10000).then(function () {
                        app[getAttachMethod(false)](fnAfterNavigate);
                        deferred.reject('navTo: takes longer than 10s, couldn\'t nav to route ' + routeName);
                    });
                    var smartConfiguration = getSmartConfiguration();
                    if (smartConfiguration && smartConfiguration.pages) {
                        // Look into the first page then inside the children
                        var firstPage = smartConfiguration.pages[0];
                        if (firstPage.pageName === routeName) {
                            getRouter().navTo(firstPage.defaultContext);
                            if (!currentView) {// Init Smart Templqte
                                $timeout(deferred.resolve, 1000);
                            }
                        }
                        else {
                            var targetPage = _.find(smartConfiguration.pages[0].pages, function (config) {
                                return config.pageName === routeName;
                            });
                            getRouter().navTo(targetPage.entitySet, {keys1: targetPage.defaultContext});
                        }
                    }
                    else {
                        getRouter().navTo(routeName);
                    }
                }
            }
            else {
                deferred.reject('window not loaded yet');
            }
            return deferred.promise.catch(function (err) {
                $log.error(err, routeName);
            });
        };

        /**
         * @name setContext
         * @memberof npUi5Helper
         * @description sets the context of the current view. Promise is rejected if no update happens or if the view is not ready
         * @params {string} path
         * @params {string} expandPaths
         * @returns {Promise} promise containing true/false
         */

        var setContext = function (path, expandPaths) {
            var currentView = getCurrentView();
            if (currentView) {
                var bindingInfo = getCurrentViewBindingInfo() || {},
                    currentPath = bindingInfo.path,
                    currentExpandPaths = bindingInfo.expandPaths;


                if (currentPath !== path || currentExpandPaths !== expandPaths) {
                    currentView.unbindObject();
                    // path must always be defined for context to wait for data received
                    if (!_.isEmpty(path)) {
                        var parameters = expandPaths ? {expand: expandPaths} : undefined;
                        currentView.bindObject(path, parameters);
                        // Force reload data
                        currentView.getObjectBinding().refresh();
                        return waitForDataReceived(currentView, currentView.getObjectBinding());
                    }
                    $q.when(true);
                }
            }
            return $q.reject();
        };

        /**
         * @name getRootControl
         * @private
         * @description returns the root control of the current view (most likely a sap.m.Page).
         * @returns {UIControl} rootControl
         */
        var getRootControl = function () {
            var view = getCurrentView();
            if (view) {
                var root = view.getContent()[0];
                return root;
            }
        };


        /**
         * @name isMasterPage
         * @private
         * @description If the current layout is master
         * @returns {boolean}
         */
        var isMasterPage = function () {
            return npLayoutHelper.getCurrentLayout() === 'Master';
        };

        /**
         * @name isDetailPage
         * @private
         * @description If the current layout is detail
         * @returns {boolean}
         */
        var isDetailPage = function () {
            return npLayoutHelper.getCurrentLayout() === 'Detail';
        };

        /**
         * @name initControl
         * @memberof npUi5Helper
         * @description creates a new instance of the control and assigns the passed id
         * @param {string} className (e.g 'sap.m.Button')
         * @param {string} [controlId]
         * @param {string} [tagName]
         * @returns {UIControl} control
         */
        var initControl = function (className, controlId, tagName) {
            var TheClass = getClass(className);
            if (controlId) {
                controlId = getCurrentView().createId(controlId);
            }
            var ctrl = new TheClass(controlId);
            if (!controlId) {
                $log.info('np-ui5-helper: control ' + className + ' initialized without id. Assigned id ', getId(ctrl));
            }
            if (tagName && isMashupControl(ctrl)) {
                ctrl.setContent('<' + tagName + '></' + tagName + '>');
            }

            return ctrl;
        };
        /**
         * @name getControlById
         * @memberof npUi5Helper
         * @description returns control object in the current view that has the passed id
         * @param {string} controlId
         * @returns {UIControl} control
         */
        var getControlById = function (controlId) {
            // TODO create id in another way
            var view = getCurrentView();
            if (view) {
                return view.byId(controlId);
            }
        };

        /**
         * @name hasRenderer
         * @memberof npUi5Helper
         * @param {UIControl} ctrl
         * @returns {boolean} hasRenderer
         */
        var hasRenderer = function (ctrl) {
            // it means it can be rendered!
            return ctrl && ctrl.getRenderer && ctrl.getRenderer();
        };
        /**
         * @name isControl
         * @private
         * @description if the input is a control or not
         * @param {Object} data
         * @returns {boolean} isControl
         */
        var isControl = function (data) {
            return data instanceof win.sap.ui.base.Object;
        };

        /**
         * @name isMashupControl
         * @memberof npUi5Helper
         * @description this method tells if a control is considered a mashup control. Mashup controls are used to wrap different ui technology and be used within sapui5 (e.g Angular directives, raw html)
         * @param {UIControl} ctrl
         * @returns {boolean} isMashup
         */
        var isMashupControl = function (ctrl) {
            win.jQuery.sap.require('sap.ui.core.HTML');
            return ctrl && ctrl instanceof win.sap.ui.core.HTML;
        };

        /**
         * @name shouldByPass
         * @private
         * @description returns if the control should be bypassed. e.g. In ABSOLUTE floorplan pages, position containers should be bypassed, and expose the control they wrap
         * @param {UIControl} ctrl
         * @returns {boolean} shouldByPass
         */
        var shouldByPass = function (ctrl) {
            return npLayoutHelper.isAbsoluteLayout() && getControlType(ctrl) === positionContainerType;
        };


        /**
         * @name insertControl
         * @memberof npUi5Helper
         * @description
         * Inserts the control into the parent's aggregation at the specified index. If the parent's aggregation accepts only one single child, it will replace it.
         * According to the floorplan type, it will create the intermediate controls that are invisible to the outside (e.g. position containers for ABSOLUTE fp).
         * Certain floorplans (e.g. ABSOLUTE) will use the left, top information to position the position container into its parent
         * @param {UIControl} control
         * @param {UIControl} parent
         * @param {string} aggregationName
         * @param {number} [i] index where to insert. If undefined and parent aggregation accepts multiple children, newControl will be appended.
         * @param {CSSSize} [left] x coord
         * @param {CSSSize} [top] y coord
         */
        var insertControl = function (control, parent, aggregationName, i, left, top) {
            if (control.getParent()) {
                $log.info('ui5Helper: control ' + getId(control) + ' has already a parent, using moveControl instead.');
                moveControl(control, parent, aggregationName, i, left, top);
                return;
            }
            var root = getRootControl();
            if (npLayoutHelper.isAbsoluteLayout() && parent === root && aggregationName === 'content') {
                var absoluteLayout = root.getContent()[0];
                // will generate proper id
                var posContainer = initControl(positionContainerType);
                setControlProperty(posContainer, 'left', left);
                setControlProperty(posContainer, 'top', top);
                _insertControl(control, posContainer, 'control');
                _insertControl(posContainer, absoluteLayout, 'positions', i);
            }
            else {
                _insertControl(control, parent, aggregationName, i);
            }
        };

        /**
         * @name _insertControl
         * @private
         * @description inserts the control into the parent's aggregation at the specified index. If the parent's aggregation accepts only one single child, it will replace it.
         * @param {UIControl} control
         * @param {UIControl} parent
         * @param {string} aggregationName
         * @param {number} [i] index where to insert. If undefined and parent aggregation accepts multiple children, newControl will be appended.
         */
        var _insertControl = function (control, parent, aggregationName, i) {
            var aggregationMd = parent.getMetadata().getAllAggregations()[aggregationName];

            var sMutatorPrefix;
            if (!aggregationMd.multiple) {
                sMutatorPrefix = 'set';
            }
            else if (typeof i === 'number') {
                sMutatorPrefix = 'insert';
            }
            else {
                sMutatorPrefix = 'add';
            }
            var sMutator = sMutatorPrefix + _.capitalize(aggregationMd.singularName);

            if (parent[sMutator]) {
                parent[sMutator](control, i);
            }
            else if (aggregationMd.multiple) {
                parent.insertAggregation(aggregationMd.name, control, i);
            }
            else {
                parent.setAggregation(aggregationMd.name, control);
            }
        };

        /**
         * @name removeControl
         * @memberof npUi5Helper
         * @description Removes the control from its parent (without deleting it).
         * If the control is wrapped into any floorplan specific controls those will be removed as well.
         * @param {string|UIControl} ctrl
         * @returns {UIControl | undefined} parent
         */
        var removeControl = function (ctrl) {
            if (typeof ctrl === 'string') {
                ctrl = getControlById(ctrl);
            }
            if (!ctrl) {
                return;
            }
            var parent = ctrl.getParent();
            if (parent && shouldByPass(parent)) {
                _removeControl(ctrl);
                ctrl = parent;
            }
            return _removeControl(ctrl);
        };

        /**
         * @private
         * @param {UIControl} ctrl
         * @description Removes ctrl from its parent aggregation.
         */
        var _removeControl = function (ctrl) {
            var parent = ctrl.getParent();
            if (!parent) {
                return;
            }
            var aggregationMd = parent.getMetadata().getAllAggregations()[ctrl.sParentAggregationName];
            if (aggregationMd) {
                var sMutator = 'remove' + _.capitalize(aggregationMd.singularName);
                if (parent[sMutator]) {
                    parent[sMutator](ctrl);
                }
                else if (aggregationMd.multiple) {
                    parent.removeAggregation(aggregationMd.name, ctrl);
                }
                else {
                    parent.setAggregation(aggregationMd.name, undefined);
                }
            }
        };

        /**
         * @name moveControl
         * @memberof npUi5Helper
         * @description moves the control into the new parent at the specified aggregation and index. If the parent's aggregation accepts only one single child, it will replace it.
         * @param {UIControl} control
         * @param {UIControl} newParent
         * @param {string} aggregationName
         * @param {number} [index] index where to insert. If undefined and parent aggregation accepts multiple children, newControl will be appended.
         * @param {CSSSize} [left] x coord
         * @param {CSSSize} [top] y coord
         */
        var moveControl = function (control, newParent, aggregationName, index, left, top) {
            if (!control.getParent()) {
                $log.info('ui5Helper: control ' + getId(control) + ' doesn\'t have a parent. Using insertControl instead.');
                insertControl(control, newParent, aggregationName, index, left, top);
                return;
            }

            var rootControl = getRootControl(),
                oldParent = control.getParent();

            if (npLayoutHelper.isAbsoluteLayout() && getControlType(oldParent) === positionContainerType && newParent === rootControl) {
                setControlProperty(oldParent, 'left', left);
                setControlProperty(oldParent, 'top', top);
            }
            else {
                removeControl(control);
                insertControl(control, newParent, aggregationName, index, left, top);
            }
        };

        /**
         * @name getChild
         * @memberof npUi5Helper
         * @description returns the nth child of an aggregation
         * @param control
         * @param aggregationName
         * @param childIndex
         * @returns {UIControl|undefined}
         */
        var getChild = function (control, aggregationName, childIndex) {
            if (!control || !aggregationName) {
                return undefined;
            }
            var aggregation = control.getAggregation(aggregationName);
            if (!_.isArray(aggregation)) {
                return aggregation;
            }
            if (childIndex >= 0 && childIndex < _.size(aggregation)) {
                return aggregation[childIndex];
            }
        };

        /**
         * @name getClass
         * @private
         * @description returns the Class given a className
         * @param {string} className
         * @returns {Object} the Class
         */
        var getClass = function (className) {
            try {
                if (!win.jQuery.sap.isDeclared(className)) {
                    win.jQuery.sap.require(className);
                }
                var TheClass = win.jQuery.sap.getObject(className);
                return TheClass;
            }
            catch (e) {
                $log.warn('getClass failed, cannot get className', className);
            }
        };

        var getControlType = function (ctrl) {
            return ctrl.getMetadata().getName();
        };

        var getCurrentEntitySet = function () {
            var view = getCurrentView();
            var viewComponent = view.getParent();
            var entitySetName = '';
            if (viewComponent) {
                entitySetName = viewComponent.getEntitySet();
            }
            return entitySetName;
        };

        /**
         * @name refreshPageFromAnnotation
         * @memberof npUi5Helper
         * @description refresh the application after we've updated the model and the annotations on the backend, to do that we have to reload the mock data, reload the annotations, and finally destroy and recreate the view in the component
         */
        var refreshPageFromAnnotation = function () {
            var view = getCurrentView();
            var viewComponent = view.getParent();
            if (viewComponent) {
                // Refresh model annotations
                var dataModel = view.getModel();
                var currentContext = view.getBindingContext();
                var _reloadView = function () {
                    viewComponent.runAsOwner(function () {
                        var newView = viewComponent._createXMLView();
                        viewComponent.setAggregation('rootControl', newView);
                        viewComponent.getUIArea().invalidate();
                        view.destroy();
                    });
                };
                var _reloadMetaModel = function () {
                    dataModel.getMetaModel().loaded().then(_reloadView);
                    dataModel.oAnnotations.detachLoaded(_reloadMetaModel);
                };
                var _reloadAnnotations = function () {
                    dataModel.oAnnotations.attachLoaded(_reloadMetaModel);
                    dataModel.oAnnotations.oAnnotations = {}; // remove existing annotations
                    dataModel.oAnnotations.addUrl(dataModel.sAnnotationURI[0]); // load new annotations
                    dataModel.oMetadata.detachLoaded(_reloadAnnotations);
                };
                var mockServer = getMockServer();
                mockServer._refreshData();
                dataModel.oMetaModel = null;
                if (currentContext) {
                    dataModel.oData = {};
                }
                dataModel.oMetadata.attachLoaded(_reloadAnnotations);
                dataModel.oMetadata.oMetadata.dataServices.schema[0].entityType = [];
                dataModel.oMetadata.oMetadata.dataServices.schema[0].entityContainer[0].entitySet = [];
                dataModel.oMetadata._loadMetadata();
            }
        };

        return {
            setWindow: setWindow,
            getWindow: getWindow,
            waitForRendering: waitForRendering,
            waitForBinding: waitForBinding,
            getChild: getChild,
            getId: getId,
            getDomRef: getDomRef,
            bindProperty: bindProperty,
            bindAggregation: bindAggregation,
            updateAggregation: updateAggregation,
            getBindingInfo: getBindingInfo,
            getControlProperty: getControlProperty,
            setControlProperty: setControlProperty,
            initControl: initControl,
            getControlById: getControlById,
            insertControl: insertControl,
            moveControl: moveControl,
            removeControl: removeControl,
            getCurrentViewName: getCurrentViewName,
            navTo: navTo,
            setContext: setContext,
            refreshPageFromAnnotation: refreshPageFromAnnotation,
            getCurrentEntitySet: getCurrentEntitySet
        };
    }
];

module.exports = npUi5Helper;
