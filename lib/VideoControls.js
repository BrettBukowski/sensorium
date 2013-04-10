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
