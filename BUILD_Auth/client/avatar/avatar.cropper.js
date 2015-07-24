'use strict';

function onMouseDown(ev) {
    ev.preventDefault();
    this.dragXY = {
        startX: this.img.left,
        startY: this.img.top,
        pageX: ev.pageX,
        pageY: ev.pageY
    };
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
}

function onMouseUp() {
    this.update();
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
}

function onMouseMove(ev) {
    this.dragXY.dx = ev.pageX - this.dragXY.pageX;
    this.dragXY.dy = ev.pageY - this.dragXY.pageY;
    this.move(this.dragXY);
}

function onMouseWheel(e) {
    e = window.event || e;
    var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
    if (delta > 0) this.zoomIn();
    else this.zoomOut();
    if (e.preventDefault) e.preventDefault();
    return false;
}

function onLoad() {
    this.img.originalWidth = this.image.width;
    this.img.originalHeight = this.image.height;
    this.img.stretch = (this.img.originalHeight < this.circle.height ||
        this.img.originalWidth < this.circle.width);

    var widthRatio = this.circle.width / this.img.originalWidth,
        heightRatio = this.circle.height / this.img.originalHeight;
    this.zoom.min = Math.max(widthRatio, heightRatio);
    this.zoomTo(this.zoom.min);
}

function checkBounds(v, b) {
    return Math.min(Math.max(v, b), 0);
}


/**
 * Image cropper widget
 * @param  {object}    options   config options
 */
function Cropper(options) {
    this.target = options.target;

    if (this.target.innerHTML) this.destroy();
    this.target.innerHTML = '<div class="img-wrapper"><img class="img"/></div><img class="bg"/>';

    this.zoom = { min: 0.1, max: 2, step: 20, value: null };
    this.img = {
        top: 0,
        left: 0,
        width: null,
        height: null,
        originalWidth: null,
        originalHeight: null
    };

    var imgWrapper = this.target.querySelector('.img-wrapper');
    this.circle = {
        x: imgWrapper.offsetLeft,
        y: imgWrapper.offsetTop,
        width: 260,
        height: 260
    };

    this.imgData = options.imgData;
    this.image = this.target.querySelector('.img-wrapper .img');
    this.bg = this.target.querySelector('.bg');

    this.callback = options.onUpdate || function () {};


    this.image.onload = onLoad.bind(this);
    this.image.src = this.imgData;
    this.bg.src = this.imgData;

    this.onMouseMove = onMouseMove.bind(this);
    this.onMouseUp = onMouseUp.bind(this);

    this.image.addEventListener('dragstart', function () {
        return false;
    });
    this.image.addEventListener('mousedown', onMouseDown.bind(this));

    this.target.addEventListener('mousewheel', onMouseWheel.bind(this));
    this.target.addEventListener('DOMMouseScroll', onMouseWheel.bind(this));
    return this;
}

Cropper.prototype.destroy = function () {
    this.target.innerHTML = '';
    var target = document.createElement('DIV');
    target.className = 'cropper';
    this.target.parentNode.replaceChild(target, this.target);
    this.target = target;
    return this;
};

/**
 * Set zoom by percentage value (1 - 100)
 */
Cropper.prototype.setZoom = function (percent) {
    var factor = (this.zoom.max - this.zoom.min) / 100;
    this.zoomTo(this.zoom.min + factor * percent);
    return this;
};

/**
 * Set percentage zoom value (1 - 100)
 */
Cropper.prototype.getZoom = function () {
    var factor = (this.zoom.max - this.zoom.min) / 100;
    return (this.zoom.value - this.zoom.min) / factor;
};

/**
 * Set zoom value (this.zoom.min - this.zoom.max)
 */
Cropper.prototype.zoomTo = function (zoom) {
    var oldZoom = this.zoom.value;
    this.zoom.value = Math.max(this.zoom.min, Math.min(this.zoom.max, zoom));
    this.img.width = Math.ceil(this.img.originalWidth * this.zoom.value);
    this.img.height = Math.ceil(this.img.originalHeight * this.zoom.value);

    var zoomD = this.zoom.value / oldZoom,
        deltaH = this.circle.height - this.img.height,
        deltaW = this.circle.width - this.img.width;

    if (oldZoom) {
        this.img.top = checkBounds((1 - zoomD) * this.circle.height / 2 + zoomD * this.img.top, deltaH);
        this.img.left = checkBounds((1 - zoomD) * this.circle.width / 2 + zoomD * this.img.left, deltaW);
    }
    else {
        this.img.top = checkBounds(deltaH / 2, deltaH);
        this.img.left = checkBounds(deltaW / 2, deltaW);
    }

    this.image.style.top = this.img.top + 'px';
    this.image.style.left = this.img.left + 'px';
    this.image.style.width = this.img.width + 'px';

    return this.update();
};

/**
 * Zoom-in one step
 */
Cropper.prototype.zoomIn = function () {
    return this.zoomTo(this.zoom.value + (1 - this.zoom.min) / (this.zoom.step - 1 || 1));
};


/**
 * Zoom-out one step
 */
Cropper.prototype.zoomOut = function () {
    return this.zoomTo(this.zoom.value - (1 - this.zoom.min) / (this.zoom.step - 1 || 1));
};

/**
 * recalculate image positions when mouse panning
 */
Cropper.prototype.move = function (data) {
    this.img.top = checkBounds(data.startY + data.dy, this.circle.height - this.img.height);
    this.img.left = checkBounds(data.startX + data.dx, this.circle.width - this.img.width);

    this.image.style.left = this.img.left + 'px';
    this.image.style.top = this.img.top + 'px';
    return this.update();
};

/**
 * Update image positions when mouse panning
 */
Cropper.prototype.update = function () {
    this.result = {
        cropX: -Math.ceil(this.img.left / this.zoom.value),
        cropY: -Math.ceil(this.img.top / this.zoom.value),
        cropW: Math.floor(this.circle.width / this.zoom.value),
        cropH: Math.floor(this.circle.height / this.zoom.value),
        stretch: this.img.stretch
    };

    var x = -(this.zoom.value * this.result.cropX - this.circle.x),
        y = -(this.zoom.value * this.result.cropY - this.circle.y);

    this.bg.style.transform = 'translateX(' + x + 'px) translateY(' + y + 'px) scale(' + this.zoom.value + ')';
    this.callback.call(this, this.result, this);
    return this;
};


/**
 * Get image as DataURI
 */
Cropper.prototype.getDataURI = function () {
    var canvas = document.createElement('canvas'), ctx = canvas.getContext('2d');
    canvas.width = this.circle.width;
    canvas.height = this.circle.height;
    ctx.drawImage(this.image, this.result.cropX, this.result.cropY, this.result.cropW,
        this.result.cropH, 0, 0, this.circle.width, this.circle.height);
    return canvas.toDataURL();
};

/**
 * Get image as Blob for posting to the server
 */
Cropper.prototype.getImage = function () {
    var uriComponents = this.getDataURI().split(',');
    var byteString = atob(uriComponents[1]);
    var mimeString = uriComponents[0].split(':')[1].split(';')[0];
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
    return new Blob([ab], { type: mimeString });
};

module.exports = Cropper;
