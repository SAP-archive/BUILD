'use strict';

function ResourceBundle(lang, resources, parent) {
    this.lang = lang || '';
    this.resources = resources || {};
    this.parent = parent; // Parent bundle for fallback
}
module.exports = ResourceBundle;

ResourceBundle.prototype.getText = function (key) {
    var text = this.resources[key];
    if ((text === undefined) && this.parent) {
        text = this.parent.getText(key);
    }
    return text;
};

ResourceBundle.prototype.setText = function (key, text) {
    this.resources[key] = text;
};
