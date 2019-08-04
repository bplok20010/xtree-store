
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = createStore;

var _TreeStore = _interopRequireDefault(require("./TreeStore"));

function createStore(data, options) {
  return new _TreeStore["default"](data, options);
}