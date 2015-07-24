'use strict';

window.norman = {
    services: {
        // ...
        // APIs to be implemented by the app, the ide will use them
        // ...
        ready: function (fn, listener) {
            fn.call(listener);
        },
        getRootControl: function () {
            if (!this._root) {
                //hard coding the id here!
                this._root = document.querySelector('body');
            }
            return this._root;
        },
        controlAtPosition: function (x, y) {
            // get dom from window
            var elem = document.elementFromPoint(x, y);
            if (this.getControlType(elem) === 'html') {
                elem = this.getRootControl();
            }
            return elem;
        },

        siblingAtPosition: function (ctrl, x, y) {
            // considering all elements as valid siblings
            return this.controlAtPosition(x, y);
        },

        moveControlToPosition: function (ctrl, x, y) {
            var sibling = this.siblingAtPosition(ctrl, x, y);
            if (!sibling || sibling === ctrl) {
                return;
            }
            var oldParent = ctrl.parentNode;
            var newParent = sibling.parentNode;
            oldParent.removeChild(ctrl);
            newParent.insertBefore(ctrl, sibling);
        },

        addSibling: function (oNewControlData, bAfter, oRefControl) {
            var parent = oRefControl.parentNode;
            var i = this._indexInParent(oRefControl);
            if (bAfter === true) {
                i++;
            }
            var sibling = parent.children[i];
            var ctrl = this._initControl(oNewControlData.ctrlType);
            parent.insertBefore(ctrl, sibling);
            return ctrl;
        },
        changeControl: function (oRefControl, oNewControlData) {
            var parent = oRefControl.parentNode;
            var i = this._indexInParent(oRefControl) + 1;
            var sibling = parent.children[i];
            var ctrl = this._initControl(oNewControlData.ctrlType);
            this.deleteControl(oRefControl);
            parent.insertBefore(ctrl, sibling);
            return ctrl;
        },
        canDeleteControl: function (elem) {
            var tagName = elem.tagName ? elem.tagName.toLowerCase() : '';
            var arr = [
                'body', 'html', 'head'
            ];
            return arr.indexOf(tagName) === -1;
        },
        deleteControl: function (elem) {
            elem.parentNode.removeChild(elem);
        },

        controlId: function (ctrl) {
            return ctrl.id;
        },

        controlDomRef: function (ctrl) {
            return ctrl;
        },
        getParent: function (ctrl) {
            var parent = ctrl.parentNode;
            return this.getControlType(parent) !== 'html' ? parent : undefined;
        },
        getControlType: function (ctrl) {
            return ctrl.tagName ? ctrl.tagName.toLowerCase() : '';
        },
        getControlProperties: function (ctrl) {
            var props = [];

            if (!ctrl.getAttribute('id')) {
                props.push({
                    name: 'id'
                });
            }
            if (ctrl.childNodes && ctrl.childNodes[0] && ctrl.childNodes[0].nodeName === '#text') {
                props.push({
                    name: 'text',
                    value: ctrl.childNodes[0].data
                });
            }
            for (var i = 0, l = ctrl.attributes.length; i < l; i++) {
                var attr = ctrl.attributes[i];
                if (attr.name !== 'style') {
                    props.push({
                        name: attr.name,
                        value: attr.value
                    });
                }
            }
            return props;
        },

        setControlProperty: function (property, ctrl) {
            if (property.name === 'text') {
                ctrl.childNodes[0].data = property.value;
            } else {
                ctrl[property.name] = property.value;
            }
        },

        canHaveSiblings: function (ctrl) {
            return this.getControlType(ctrl) !== 'body';
        },

        getPaletteForContainerOfControl: function (ctrl) {
            return [
                {
                    ctrlType: 'div'
                }, {
                    ctrlType: 'label'
                }, {
                    ctrlType: 'button'
                }, {
                    ctrlType: 'span'
                }, {
                    ctrlType: 'ul'
                }, {
                    ctrlType: 'ol'
                }, {
                    ctrlType: 'img'
                }, {
                    ctrlType: 'p'
                }
            ];
        },

        getPaletteForGroup: function (group) {
            return this.getPaletteForContainerOfControl();
        },

        getGroups: function (ctrl) {
            if (this.getControlType(ctrl) === 'img') {
                return undefined;
            }
            var children = [];
            for (var i = 0, l = ctrl.childElementCount; i < l; i++) {
                var node = ctrl.children[i];
                children.push(node);
            }
            return [
                {
                    groupId: 'children',
                    children: children
                }
            ];
        },

        emptyGroup: function (oCtrl, group) {
            while (oCtrl.firstChild) {
                oCtrl.removeChild(oCtrl.firstChild);
            }
        },
        addChild: function (childData, parent, parentGroup, index) {
            var child = this._initControl(childData.ctrlType);
            return this.moveChild(child, parent, parentGroup, index);
        },
        moveChild: function (child, parent, parentGroup, index) {
            if (child.parentNode) {
                child.parentNode.removeChild(child);
            }
            if (typeof index === 'number' && parent.children[index]) {
                parent.insertBefore(child, parent.children[index]);
            }
            else {
                parent.appendChild(child);
            }
            return child;
        },

        // internal methods

        _initControl: function (sType) {
            var para = document.createElement(sType);
            var node;
            if (sType === 'img') {
                para.src = 'images/image.jpg';
                para.alt = 'image text';
                para.width = '100';
                para.height = '100';
            } else if (sType === 'ul' || sType === 'ol') {
                node = this._initControl('li');
            } else {
                node = document.createTextNode('This is a new ' + sType);
            }
            if (node) {
                para.appendChild(node);
            }
            return para;
        },
        _indexInParent: function (elem) {
            var i = 0;
            while (( elem = elem.previousSibling ) !== null)
                i++;
            return i;
        }
    }
};
