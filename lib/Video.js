"use strict";

var bind = require('bind');

module.exports = Video;

window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;

/**
 * ## Video
 * Encapsulates the video element.
 * @param {Object=} [attrs={}] Options:
 *
 * - width: {String} pixels
 * - height: {String} pixels
 */
function Video (attrs) {
  this.options = attrs;

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

  /**
   * ### attachTo
   * Attach the video element onto the given container element.
   * @chainable
   * @param  {Object} container Parent
   * @return {Video}
   */
  attachTo: function (container) {
    container.appendChild(this.vidContainer);

    return this;
  },

  /**
   * ### attachControls
   * Attach controls into the video container.
   * Controls should be duck-typed to:
   *
   * - `header()`: returns an HTMLElement
   * - `footer()`: returns an HTMLElement
   *
   * @chainable
   * @param  {Object} controls
   * @return {Video}
   */
  attachControls: function (controls) {
    this.controlPanel = document.createElement('div');
    this.vid.parentNode.insertBefore(this.controlPanel, this.vid);

    this.controlPanel.appendChild(controls.header());
    this.controlPanel.appendChild(controls.footer());

    return this;
  },

  /**
   * ### setMediaStream
   * Sets the video `src` to the given MediaStream.
   * @param {Object} stream
   * @return {Video}
   */
  setMediaStream: function (stream) {
    this.stream = stream;

    this.vid.src = window.URL ? window.URL.createObjectURL(stream) : stream;

    return this;
  },

  /**
   * ### getVideoElement
   * Returns the Video element.
   * @return {HTMLElement}
   */
  getVideoElement: function () {
    return this.vid;
  },

  /**
   * Kills the video element, stops the media stream. Closes up shop.
   * @return {Video}
   */
  destroy: function () {
    this.stream.stop();

    this.vidContainer.parentNode.removeChild(this.vidContainer);

    this.vid = this.vidContainer = null;

    return this;
  }
};
