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

function Sensorium (container, options) {
  this._setContainer(container);
  this.options = this._extend({
    width: '400px',
    height: '300px'
  }, options);

  emitter(this);

  this._init();
}

Sensorium.prototype = {
  _init: function () {
  },

  _setContainer: function (container) {
    if (typeof container === 'string') {
      container = document.querySelector(container);
    }

    this.container = container || document.body;
  },

  _extend: function(dest, source) {
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
    this.emit('getUserMedia:error', err, this.vid);
  },

  _userMediaSuccess: function (stream) {
    this._initVideo();

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

  _createCanvas: function () {
    var canvas = document.createElement('canvas');
    canvas.width = parseFloat(this.options.width);
    canvas.height = parseFloat(this.options.height);

    return canvas;
  },

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

  capture: function () {
    this._canvas || (this._canvas = this._createCanvas());
    this._canvas.getContext('2d').drawImage(this.vid.vid, 0, 0, parseFloat(this.options.width), parseFloat(this.options.height));

    var data = this._canvas.toDataURL('image/png');

    this._updateImage(data);

    this.emit('capture', data);
  },

  stop: function () {
    this.videoControls.destroy();
    this.vid.destroy();
  },

  start: function () {
    navigator.getUserMedia({ video: true }, bind(this, this._userMediaSuccess), bind(this, this._userMediaError));
  }
};

Sensorium.Labels = {
  CANCEL: 'Cancel',
  TAKE_PICTURE: 'Take Picture'
};
