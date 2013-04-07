"use strict";

var emitter = require('emitter');
var bind = require('bind');

module.exports = VideoControls;

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

  _createHeader: function () {
    var header = this._createElement('div', { className: 'controls header' }),
        a = this._createElement('a', {
          href: '#',
          innerHTML: this.labels.CANCEL
        });

    a.addEventListener('click', bind(this, this.clickHandler, 'cancel'));

    header.appendChild(a);

    return header;
  },

  _createFooter: function () {
    var footer = this._createElement('div', { className: 'controls footer' }),
        button = this._createElement('button', {
          type: 'button',
          innerHTML: this.labels.TAKE_PICTURE
        });

    button.addEventListener('click', bind(this, this.clickHandler, 'capture'));

    footer.appendChild(button);

    return footer;
  },

  header: function () {
    return (this._header || (this._header = this._createHeader()));
  },

  footer: function () {
    return (this._footer || (this._footer = this._createFooter()));
  },

  clickHandler: function (name, e) {
    e && e.preventDefault();

    this.emit(name);
  },

  destroy: function () {
    this._removeElement(this._header);
    this._removeElement(this._footer);

    this._header = this._footer = null;
  }
};
