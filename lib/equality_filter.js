// Copyright 2014 Mark Cavage, Inc.  All rights reserved.
// Copyright 2015 Patrick Mooney

var util = require('util');
var assert = require('assert-plus');

var helpers = require('./helpers');


///--- API

function EqualityFilter(options) {
  assert.optionalObject(options);
  if (options) {
    assert.string(options.attribute, 'options.attribute');
    this.attribute = options.attribute;
    // Prefer Buffers over strings to make filter cloning easier
    if (options.raw) {
      this.raw = options.raw;
    } else {
      this.raw = new Buffer(options.value);
    }
  } else {
    this.raw = new Buffer(0);
  }
}
util.inherits(EqualityFilter, helpers.Filter);
Object.defineProperties(EqualityFilter.prototype, {
  type: {
    get: function getType() { return 'equal'; },
    configurable: false
  },
  value: {
    get: function getValue() {
      return (Buffer.isBuffer(this.raw)) ? this.raw.toString() : this.raw;
    },
    set: function setValue(val) {
      if (typeof (val) === 'string') {
        this.raw = new Buffer(val);
      } else if (Buffer.isBuffer(val)) {
        this.raw = new Buffer(val.length);
        val.copy(this.raw);
      } else {
        this.raw = val;
      }
    },
    configurable: false
  },
  json: {
    get: function getJson() {
      return {
        type: 'EqualityMatch',
        attribute: this.attribute,
        value: this.value
      };
    },
    configurable: false
  }
});

EqualityFilter.prototype.toString = function toString() {
  return ('(' + helpers.escape(this.attribute) +
          '=' + helpers.escape(this.value) + ')');
};

EqualityFilter.prototype.matches = function matches(target, strictAttrCase) {
  assert.object(target, 'target');

  var tv = helpers.getAttrValue(target, this.attribute, strictAttrCase);
  var value = this.value;

  return helpers.testValues(function (v) {
    return value === v;
  }, tv);
};


///--- Exports

module.exports = EqualityFilter;
