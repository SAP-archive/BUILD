'use strict';

(function () {

    /**
     *  Store the initial lenght of the page history.
     *  This value is used to determine wheter the iframe can go back or not
     *  as the history object is shared between main window and iframe
     */
    var initialHistoryLength,
        historyGo = window.history.go;

    /**
     * Replace the history.go and history.back to prevent
     * back buttons from navigating back the main window
     */
    window.history.go = function (val) {
        if (!initialHistoryLength) {
            historyGo.call(window.history, val);
        }
        else if (window.history.length + val >= initialHistoryLength) {
            // multiply the value by two as the iframe overlay makes the history grow by two on every page change
            historyGo.call(window.history, val);
        }
    };

    window.history.back = function () {
        window.history.go(-1);
    };

    /**
     * This handles massages from the parent
     * @param event
     */
    var handleMessage = function (event) {
        // allow the iFrame reload to be triggered - can be used when hash change requires a reload
        if (event.data === 'reloadIframe') {
            location.reload();
        }
        else if (event.data.type === 'historyLength') {
            initialHistoryLength = event.data.value;
        }
        else if (event.data.type === 'scrollIFrame') {
            document.body.scrollTop = event.data.value.scrollTop;
            document.body.scrollLeft = event.data.value.scrollLeft;
            parent.postMessage({
                type: 'finishedScroll'
            }, location.origin);
        }
    };

    window.addEventListener('message', handleMessage, false);

    parent.postMessage({
        type: 'iframeOnload',
        location: document.location.href
    }, location.origin);

    var hashChangeHandler = function (e) {
        parent.postMessage({
            type: 'iframeHashchange',
            newLocation: e.newURL
        }, location.origin);
    };

    window.addEventListener('hashchange', hashChangeHandler, false);

    /** Tracking Functionality
     * - applied to every click inside a task item
     * - pageUrl is the URL of the interaction URL not the browser URL
     */
    function attachClickListener() {
        document.body.addEventListener('click', function (e) {

            var trackingObject = {
                type: 'iframeClick',
                clickX: e.x,
                clickY: e.y,
                scrollTop: e.currentTarget.scrollTop,
                scrollLeft: e.currentTarget.scrollLeft,
                domElementId: e.srcElement.id,
                domElementHeight: e.srcElement.offsetHeight,
                domElementWidth: e.srcElement.offsetWidth,
                domElementX: e.srcElement.x,
                domElementY: e.srcElement.y,
                domElementText: e.srcElement.textContent,
                domElementTag: e.srcElement.tagName,
                pageHeight: document.body.clientHeight,
                pageWidth: document.body.clientWidth,
                pageTitle: document.title,
                pageUrl: document.location.pathname + document.location.hash
            };

            parent.postMessage(trackingObject, location.origin);
        }, false);
    }

    document.addEventListener('DOMContentLoaded', attachClickListener, false);

    window.addEventListener('scroll', function () {
       var body = document.body;
       parent.postMessage({
           type: 'iFrameScroll',
           scrollDimensions: {
               scrollTop: body.scrollTop,
               scrollLeft: body.scrollLeft
           }
       }, location.origin);
    });

    window.addEventListener('load', function () {
        var body = document.body;
        var html = document.documentElement;
        var height = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
        var width = Math.max(body.scrollWidth, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth);
        var style = getComputedStyle(document.body);
        var marginY = parseInt(style.getPropertyValue('margin-top'), 10) + parseInt(style.getPropertyValue('margin-bottom'), 10);
        var marginX = parseInt(style.getPropertyValue('margin-left'), 10) + parseInt(style.getPropertyValue('margin-right'), 10);

        parent.postMessage({
            type: 'pageSize',
            page: {
                width: width + marginX,
                height: height + marginY
            }
        }, location.origin);
    }, false);

    var errorHandler = function (event) {
        event.preventDefault();
        parent.postMessage({
            type: 'iframeError',
            errorMsg: event.message
        }, location.origin);
    };
    window.addEventListener('error', errorHandler, true);

    window.addEventListener('beforeunload', function () {
        parent.postMessage({
            type: 'beforeUnload'
        }, location.origin);
    });

})();
