// -------------------------------------------------
// Only do anything if jQuery isn't defined

if (typeof jQuery == 'undefined') {
    if (typeof $ == 'function') {
// warning, global var
        var originalDollarFunction = $;
    }

    function getScript(url, success) {
        var script     = document.createElement('script');
        script.src = url;
        var head = document.getElementsByTagName('head')[0],
            done = false;
// Attach handlers for all browsers
        script.onload = script.onreadystatechange = function() {
            if (!done && (!this.readyState || this.readyState == 'loaded' || this.readyState == 'complete')) {
                done = true;
// callback function provided as param
                success();
                script.onload = script.onreadystatechange = null;
                head.removeChild(script);
                if (originalDollarFunction) {
                    $ = originalDollarFunction;
                }
            };
        };
        head.appendChild(script);
    };
    getScript('http://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js', function() {
        initDragDrop(jQuery);

    });


function initDragDrop( $ ) {
    $.fn.simulateDragDrop = function (options) {
        return this.each(function () {
            new $.simulateDragDrop(this, options);
        });
    };
    $.simulateDragDrop = function (elem, options) {
        console.log("begin of simulateDragDrop function!!!! " + elem);
        this.options = options;
        this.simulateEvent(elem, options);
        console.log("end of simulateDragDrop function!!!! ");
    };
    $.extend($.simulateDragDrop.prototype, {
        simulateEvent: function (elem, options) {
            /*Simulating drag start*/
            var type = 'dragstart';
            var event = this.createEvent(type);
            this.dispatchEvent(elem, type, event);


            /*Simulating drop*/
            var canvasElem = $(options.dropTarget);

            type = 'dragenter';
            var dragenterEvent = this.createEvent(type, canvasElem);
            this.dispatchEvent(canvasElem[0], type, dragenterEvent);

            type = 'dragover';
            var dragoverEvent = this.createEvent(type, canvasElem);
            this.dispatchEvent(canvasElem[0], type, dragoverEvent);

            type = 'drop';
            var dropEvent = this.createEvent(type, canvasElem);
            dropEvent.dataTransfer = event.dataTransfer;
            this.dispatchEvent(canvasElem[0], type, dropEvent);

            /*Simulating drag end*/
            type = 'dragend';
            var dragEndEvent = this.createEvent(type);
            dragEndEvent.dataTransfer = event.dataTransfer;
            this.dispatchEvent(elem, type, dragEndEvent);
        },
        createEvent: function (type, elem) {
            var event = document.createEvent("CustomEvent");
            event.initCustomEvent(type, true, true, null);
            event.dataTransfer = {
                data: {},
                setData: function (type, val) {
                    this.data[type] = val;
                },
                getData: function (type) {
                    return this.data[type];
                },
                setDragImage: function() {

                }
            };
            if (elem !== undefined) {
                event.pageX = elem.offset().left + 10;
                event.pageY = elem.offset().top + 10;
            }
            return event;
        },
        dispatchEvent: function (elem, type, event) {
            if (elem.dispatchEvent) {
                elem.dispatchEvent(event);
            } else if (elem.fireEvent) {
                elem.fireEvent("on" + type, event);
            }
        }
    });
}



};


