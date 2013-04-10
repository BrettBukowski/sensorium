
/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module.exports) {
    module.exports = {};
    module.client = module.component = true;
    module.call(this, module.exports, require.relative(resolved), module);
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);
  var index = path + '/index.js';

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
  }

  if (require.aliases.hasOwnProperty(index)) {
    return require.aliases[index];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("component-indexof/index.js", function(exports, require, module){

var indexOf = [].indexOf;

module.exports = function(arr, obj){
  if (indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};
});
require.register("component-emitter/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var index = require('indexof');

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  fn._off = on;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var i = index(callbacks, fn._off || fn);
  if (~i) callbacks.splice(i, 1);
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks[event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

});
require.register("component-bind/index.js", function(exports, require, module){

/**
 * Slice reference.
 */

var slice = [].slice;

/**
 * Bind `obj` to `fn`.
 *
 * @param {Object} obj
 * @param {Function|String} fn or string
 * @return {Function}
 * @api public
 */

module.exports = function(obj, fn){
  if ('string' == typeof fn) fn = obj[fn];
  if ('function' != typeof fn) throw new Error('bind() requires a function');
  var args = [].slice.call(arguments, 2);
  return function(){
    return fn.apply(obj, args.concat(slice.call(arguments)));
  }
};

});
require.register("sensorium/index.js", function(exports, require, module){
"use strict";
module.exports = require("./lib/Sensorium");

});
require.register("sensorium/lib/Sensorium.js", function(exports, require, module){
/**
 * Exposed as a public interface.
 */

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

});
require.register("sensorium/lib/Video.js", function(exports, require, module){
/**
 * Internal use only - not exposed as a public interface.
 */

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
    this.vidContainer = this._createVideoContainer();
    this.vid = this.vidContainer.appendChild(this._createVideo());
  },

  _createVideo: function () {
    var vid = document.createElement('video');
    vid.autoplay = true;

    return vid;
  },

  _createVideoContainer: function () {
    var container = document.createElement('div');
    container.className = 'sensorium';
    container.style.width = this._toPixels(this.options.width);
    container.style.height = this._toPixels(this.options.height);

    return container;
  },

  _toPixels: function (val) {
    return (typeof val === 'string' && val.indexOf('px') > 0) ? val : val + 'px';
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

});
require.register("sensorium/lib/VideoControls.js", function(exports, require, module){
/**
 * Internal use only - not exposed as a public interface.
 */

"use strict";

var emitter = require('emitter');
var bind = require('bind');

module.exports = VideoControls;

/**
 * ## VideoControls
 * Encapsulates video controls.
 * @param {Object} labels
 */
function VideoControls (labels) {
  this.labels = labels;

  emitter(this);
}

VideoControls.prototype = {
  _createElement: function (tagName, attrs) {
    var el = document.createElement(tagName);

    for (var i in attrs) {
      if (attrs.hasOwnProperty(i)) {
        el[i] = attrs[i];
      }
    }

    return el;
  },

  _removeElement: function (el) {
    if (el) {
      return el.parentNode.removeChild(el);
    }
  },

  _createLabel: function (text, className) {
    return '<i class="' + className + '"></i> <span class="label">' + text + '</span>';
  },

  /**
   * Creates header HTMLElement containing single `<a>` close link.
   */
  _createHeader: function () {
    var header = this._createElement('div', { className: 'controls header' }),
        a = this._createElement('a', {
          href: '#',
          innerHTML: this._createLabel(this.labels.CANCEL, VideoControls.Classes.CANCEL)
        });

    // **cancel event**: called when the header link is clicked
    a.addEventListener('click', bind(this, this.clickHandler, 'cancel'));

    header.appendChild(a);

    return header;
  },

  /**
   * Creates footer HTMLElement containing single `<button>` capture button.
   */
  _createFooter: function () {
    var footer = this._createElement('div', { className: 'controls footer' }),
        button = this._createElement('button', {
          type: 'button',
          innerHTML: this._createLabel(this.labels.TAKE_PICTURE, VideoControls.Classes.TAKE_PICTURE)
        });

    // **capture event**: called when the footer button is clicked
    button.addEventListener('click', bind(this, this.clickHandler, 'capture'));

    footer.appendChild(button);

    return footer;
  },

  /**
   * ### header
   * Returns the HTMLElement to be used for the controls header.
   */
  header: function () {
    return (this._header || (this._header = this._createHeader()));
  },

  /**
   * ### footer
   * Returns the HTMLElement to be used for the controls footer.
   */
  footer: function () {
    return (this._footer || (this._footer = this._createFooter()));
  },

  clickHandler: function (name, e) {
    e && e.preventDefault();

    this.emit(name);
  },

  /**
   * Destroy the elements and close up shop.
   */
  destroy: function () {
    this._removeElement(this._header);
    this._removeElement(this._footer);

    this._header = this._footer = null;
  }
};

/**
 * ## VideoControls.Classes
 * Icon classes for UI components.
 */
VideoControls.Classes = {
  CANCEL:       'icon-remove',
  TAKE_PICTURE: 'icon-camera'
};

});
require.alias("component-emitter/index.js", "sensorium/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-bind/index.js", "sensorium/deps/bind/index.js");

