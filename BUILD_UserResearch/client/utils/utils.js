'use strict';
var _ = require('norman-client-tp').lodash;

// @ngInject
module.exports = function ($location, $filter) {

    var parser;
    return {
        /* slashes are removed to stop false negatives on compare */
        compareURIs: function (uri1, uri2) {

            // Remove trailing '/'s and '#'s
            function cleanUrlEnd(url) {
                if (url.substr(-1) === '/' || url.substr(-1) === '#') {
                    return cleanUrlEnd(url.substr(0, url.length - 1));
                }
                return url;
            }

            uri1 = decodeURIComponent(uri1);
            uri2 = decodeURIComponent(uri2);

            return (cleanUrlEnd(uri1) === cleanUrlEnd(uri2));
        },

        getRelativeURI: function (unparsedURI, returnObject) {
            if (parser === null || parser === undefined) {
                parser = document.createElement('a');
            }
            parser.href = unparsedURI;
            if (returnObject) {
                return {
                    pathname: parser.pathname,
                    hash: parser.hash
                };
            }
            return parser.pathname + parser.hash;
        },
        /**
         * gets the context for a smartTemplate hash
         *
         * e.g. from '#/SalesOrder('pears')' or from '/api/some/url/index.html#/SalesOrder('pears')'
         * we will get the entity 'SalesOrder' & the data 'pears'
         *
         * @param unparsedURI
         * @returns {{entity: *, data: *}}
         */
        getContextFromUrl: function (unparsedURI, snapshotUILang) {
            if (typeof unparsedURI !== 'undefined') {
                var regex = /([\/\.:a-zA-Z0-9]{0,})#\/([A-Za-z0-9]{1,})\({0,1}\'{0,1}([A-Za-z0-9]{0,})\'{0,1}\){0,1}/g;
                var groups = regex.exec(unparsedURI);
                if (groups && groups.length > 2) {
                    return {
                        context_type: snapshotUILang,
                        entity: groups[2],
                        data: groups[3]
                    };
                }
            }
            return {
                context_type: snapshotUILang,
                entity: '',
                data: ''
            };
        },

        /**
         * editUrlParameter
         * Update a url parameter given the url, a key and the new value
         *
         * @param currentUrl : the current full url being modified
         * @param key : the url property that prepends the value being cahnged (e.g. ../key/value)
         * @param value : the the value that will be placed in the url after the key
         * @param fullPath : (optional) - true            : return a full url path
         *                              - false (default) : return a relative url path
         * @returns returns the updated url path (or null if the function has failed)
         */
        editUrlParameter: function (currentUrl, key, value, fullPath) {
            // remove trailing characters
            var tempURL = currentUrl;
            tempURL = tempURL.split('/');

            // find the value to be change
            if (typeof key === 'string') {
                var keyIndex = tempURL.indexOf(key);
                if (keyIndex > -1) {
                    var index = keyIndex + 1;
                }
                else {
                    throw new Error('Cannot find parameter because the key is not present in the given URL');
                }
            }
            else {
                throw new Error('Cannot find parameter because the key is not a String');
            }
            // change the value in the url
            if (tempURL[index] !== undefined) {
                tempURL[index] = value;

                var newURL = tempURL.join('/');
                if (fullPath === undefined || fullPath === null || fullPath === false) {
                    return this.getRelativeURI(newURL);
                }
                return newURL;
            }
            throw new Error('Cannot replace \'value\' because the URL contained no initial value');
        },

        /**
         * verifyIframe
         * Ensures that a message from an iframe is from the iframe we created.
         *
         * @param iframeId : the id of the iframe we created
         * @param event : the message event we are verifying
         * @returns true if message is verified
         */
        verifyIframe: function (iframeId, event) {
            // Get the iframe
            var frame = document.getElementById(iframeId);
            // verify the origin of the iframe message
            return frame !== null &&
                ((event.origin === 'null' || event.origin === window.location.origin) &&
                    event.source === frame.contentWindow);
        },

        /**
         * textCountValidation
         * Checks that given text doesn't exceed a given limit (safely)
         *
         * @param inputText : the text being checked
         * @param maxChars : the maximum number of characters allowed
         * @returns an object containing:
         *          max : the new maximum value for characters to allow for new lines
         *          remaining : the number of character that can still be added to the string within it's given limit
         */
        textCountValidation: function (inputText, maxChars) {
            if (inputText !== undefined) {
                // Fix for chrome/firefox counting carriage returns as two characters
                var maxLength = maxChars;
                var i = inputText.length;
                while (i--) {
                    if (inputText.charAt(i) === '\n') {
                        maxLength++;
                    }
                }
                var remainingCharacters = maxChars - inputText.length;
                return {
                    max: maxLength,
                    remaining: remainingCharacters
                };
            }
            return {
                max: maxChars,
                remaining: maxChars
            };
        },

        /**
         * shortenText
         * shortens given text to a given limit, to the last full word and adds an ellipses
         *
         * @param text : the text being shortened
         * @param limit : the maximum length of the shortened text
         * @returns returns the formatted text
         */
        shortenText: function (text, limit) {
            if (text.length > limit) {
                var limitedString = $filter('limitTo')(text, limit);
                // want the last full word
                var sliceEnd = 0;
                for (var i = limitedString.length; limitedString[i] !== ' ' && i >= 0; i--) {
                    sliceEnd = i;
                }
                if (sliceEnd > 0) {
                    limitedString = limitedString.slice(0, sliceEnd) + '...';
                }
                return limitedString;
            }
            return text;
        },

        /**
         * Broadcasts event to the file-upload control to clear the progress for the files specified.
         * @param aFiles List of the files that were uploaded - must have sequence numbers!
         */
        clearFileUploadProgress: function (scope, aFiles) {
            if (aFiles && aFiles.length) {
                var aSequenceNums = _.pluck(aFiles, 'sequence');
                scope.$broadcast('clear-file-upload-progress', aSequenceNums);
            }
        }

    };

};
