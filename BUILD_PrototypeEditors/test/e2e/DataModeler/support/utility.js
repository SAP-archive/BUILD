/**
 * Created by I311016 on 13/01/2015.
 */
var chai = require('norman-testing-tp').chai;
var expect = chai.expect;
var Chance = require('norman-testing-tp').chance, chance = new Chance();
var request = require('superagent');
var fs = require('fs');

module.exports = {

    importXL: function (url, cookies, pathToXLFile) {
        /**
         * Returns the value of the first cookie whose 'name' property matches.
         *
         * @param {array} cookies The array of cookies
         * @param {string} namePropertyValue The value that the name property must match.
         * @returns {string} The value of the 'value' property. Returns an empty string if nothing was matched.
         */
        var getCookieValue = function (cookies, namePropertyValue) {
            var cookie, i, l = cookies.length;
            for (i = 0; i < l; i++) {
                cookie = cookies[i];
                if (cookie.name === namePropertyValue) {
                    return cookie.value;
                }
            }
            return "";
        };

        var defer = protractor.promise.defer();
        var cookie = {
            XCSRFToken: getCookieValue(cookies, "X-CSRF-Token"),
            buildSessionId: getCookieValue(cookies, "buildSessionId")
        };

        console.log("Path to Excel file =" + pathToXLFile);
        setTimeout( function() {
                request.post(url)
                    .set('Cookie', 'buildSessionId=' + cookie.buildSessionId + '; X-CSRF-Token=' + cookie.XCSRFToken)
                    .set('X-CSRF-Token', cookie.XCSRFToken)
                    .set('Content-Disposition', 'form-data; name="file";')
                    .set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
                    .attach('file', pathToXLFile)
                    .end(function (res) {
                        if (res.error) {
                            console.log(res.error);
                            defer.reject({
                                error: res.error
                            });
                        }
                        else {
                            console.log("upload ok");
                            defer.fulfill(res.body);
                        }
                    });

            }, 7500

        )
        return defer.promise;
    }
}
