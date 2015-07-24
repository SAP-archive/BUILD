/**
 * Created by I316890 on 31/03/2015.
 */

'use strict';

var Archiver = function (value, cb) {
    if (value.length > 0) {
        //var url = value.charAt(0) == '/' ? value : "/" + value;
        browser.get(value);
    }
    if (typeof cb === 'function') cb();
};

Archiver.prototype = Object.create({}, {


    clickArchiveBtn: {
        value: function () {
            this.archiveProject.click();
        }
    },
    archiveProject: {
        get: function () {
            return element(by.css('[ng-click="archiveProject()"]'));
        }
    },

    archiveLink: {
        get: function () {
            return element(by.css('.archived-project-count-text'))
        }
    },

    clickCheckbox: {
        value: function () {
            var control = browser.driver.findElement(by.id('chb-archive'));
            browser.driver.executeScript("arguments[0].style.display = 'inline'; ", control).then(function () {
                control.click();
            });
        }
    }
});

module.exports = Archiver;
