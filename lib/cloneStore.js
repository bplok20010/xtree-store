
"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = cloneStore;

var _assign = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/assign"));

function cloneStore(store) {
  var newStore = new store.constructor([], store.options);
  newStore.__NodeList = store.__NodeList.map(function (v) {
    return v;
  });
  newStore.__NodeMap = (0, _assign.default)({}, store.__NodeMap);
  return newStore;
}