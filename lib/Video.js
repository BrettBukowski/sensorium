"use strict";

var bind = require('bind');

module.exports = Video;

window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;

function Video (attrs) {
  this.options = attrs || {};

  this._init();
}

Video.prototype = {
  _init: function () {
    this.vidContainer = document.createElement('div');
    this.vidContainer.className = 'sensorium';

    this.vid = document.createElement('video');
    this.vid.autoplay = true;
    this.vidContainer.style.width = this.options.width;
    this.vidContainer.style.height = this.options.height;

    this.vidContainer.appendChild(this.vid);
  },

  attachTo: function (container) {
    container.appendChild(this.vidContainer);

    return this;
  },

  attachControls: function (controls) {
    this.controlPanel = document.createElement('div');
    this.vid.parentNode.insertBefore(this.controlPanel, this.vid);

    this.controlPanel.appendChild(controls.header());
    this.controlPanel.appendChild(controls.footer());

    return this;
  },

  setMediaStream: function (stream) {
    this.stream = stream;

    this.vid.src = window.URL ? window.URL.createObjectURL(stream) : stream;

    return this;
  },

  destroy: function () {
    this.stream.stop();

    this.vidContainer.parentNode.removeChild(this.vidContainer);

    this.vid = this.vidContainer = null;

    return this;
  }
};
