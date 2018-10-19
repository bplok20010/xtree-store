
"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = cloneStore;

var _keys = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/keys"));

var _assign = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/assign"));

function cloneStore(store) {
  var newStore = new store.constructor(null, store.options);
  newStore.__NodeList = store.__NodeList.map(function (v) {
    return v;
  });
  newStore.__NodeMap = (0, _assign.default)({}, store.__NodeMap);
  var caches = store._caches;
  var newCache = newStore._cache;
  (0, _keys.default)(caches).forEach(function (key) {
    newCache.set(key, caches[key]);
  });
  return newStore;
}