"use strict";

var Video = require('./Video'),
    VideoControls = require('./VideoControls'),
    bind = require('bind'),
    emitter = require('emitter');

module.exports = Sensorium;

navigator.getUserMedia = navigator.getUserMedia ||
              navigator.webkitGetUserMedia ||
              navigator.mozGetUserMedia ||
              navigator.msGetUserMedia;

/**
 * ## Sensorium
 * Sets up the video.
 * @constructor
 * @param {Object|String} container Element to insert the video into;
 *  Either an HTMLElement or String selector
 * @param {Object=} [options={}] Options:
 *
 * - width: {String} width (in pixels) defaults to 400px
 * - height: {String} height (in pixels) defaults to 300px
 * - img: {String|Object} String selector or HTMLElement: image element to
 *    receive the captured image.
 *
 * *****
 *
 *  Width and height should be specified in a 4:3 aspect ratio.
 *  If not supplied in that way, the browser will still maintain
 *  the proper aspect ratio according to the max width or height
 *  specified but adds padding width or height in the other axis
 *  accomodate.
 */
function Sensorium (container, options) {
  this._init(container, options);
}

Sensorium.prototype = {
  _init: function (container, options) {
    this._setContainer(container);
    this.options = this._extend({
      width: '400px',
      height: '300px'
    }, options);

    emitter(this);
  },

  /**
   * Sets the container.
   * Defaults to `document.body` if a valid
   * element can't be found.
   */
  _setContainer: function (container) {
    if (typeof container === 'string') {
      container = document.querySelector(container);
    }

    this.container = container || document.body;
  },

  _extend: function (dest, source) {
    if (source) {
      for (var i in source) {
        var val = source[i];
        if (typeof val !== 'undefined') {
          dest[i] = val;
        }
      }
    }

    return dest;
  },

  _userMediaError: function (err) {
    // **getUserMedia:error event**: passed error object
    this.emit('getUserMedia:error', err);
  },

  _userMediaSuccess: function (stream) {
    this._initVideo();

    // **getUserMedia:success event**: passed the MediaStream and video object
    this.emit('getUserMedia:success', stream, this.vid);

    this.vid.setMediaStream(stream);
  },

  _initVideo: function () {
    this.videoControls = this._createVideoControls();
    this.vid = this._createVideo().attachControls(this.videoControls);
  },

  _createVideo: function () {
    return new Video(this.options).attachTo(this.container);
  },

  _createVideoControls: function () {
    var controls = new VideoControls(Sensorium.Labels);

    controls.on('cancel', bind(this, this.stop));
    controls.on('capture', bind(this, this.capture));

    return controls;
  },

  // The video stream's content has to be drawn to a canvas
  // in order to get a frame. Fortunately, this canvas
  // doesn't have to be actually inserted into the document.
  _createCanvas: function () {
    var canvas = document.createElement('canvas');
    canvas.width = parseFloat(this.options.width);
    canvas.height = parseFloat(this.options.height);

    return canvas;
  },

  _getRenderedCanvasData: function () {
    this._canvas || (this._canvas = this._createCanvas());
    this._canvas.getContext('2d').drawImage(this.vid.getVideoElement(), 0, 0, parseFloat(this.options.width), parseFloat(this.options.height));

    return this._canvas.toDataURL('image/png');
  },

  // If `img` was specified in the options to Sensorium,
  // its `src` attribute is updated to the captured image frame.
  _updateImage: function (dataURI) {
    if (this.options.img) {
      if (typeof this.options.img === 'string') {
        this.options.img = document.querySelector(this.options.img);
      }

      if ('src' in this.options.img) {
        this.options.img.src = dataURI;

        return true;
      }
    }

    return false;
  },

  /**
   * ### start
   * Call to start the media capture process.
   * This will trigger the browser asking the user
   * if she wants to allow access.
   */
  start: function () {
    navigator.getUserMedia({ video: true }, bind(this, this._userMediaSuccess), bind(this, this._userMediaError));
  },

  /**
   * ### capture
   * Call to capture an image on the media stream.
   * `start` must have already have been called.
   */
  capture: function () {
    var data = this._getRenderedCanvasData();
    this._updateImage(data);
    // **capture event**: passed the data URI image data
    this.emit('capture', data);
  },

  /**
   * ### stop
   * Call to stop capturing and to destroy the video element.
   * `start` must have already have been called.
   */
  stop: function () {
    this.videoControls.destroy();
    this.vid.destroy();
  }
};

/**
 * ## Sensorium.Labels
 * Labels used for the UI.
 */
Sensorium.Labels = {
  // cancel label
  CANCEL: 'Cancel',
  // take picture label
  TAKE_PICTURE: 'Take Picture'
};
