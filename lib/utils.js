
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isEqual = isEqual;
exports.isUndefined = isUndefined;
exports.undef = undef;

function isEqual(a, b) {
  return a + '' === b + '';
}

function isUndefined(a) {
  return a === undefined;
}

function undef(a, b) {
  return a === undefined ? b : a;
}