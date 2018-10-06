
"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = normalize;

var _assign = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/assign"));

var id = 1;

function normalize(data, defaults) {
  var node = (0, _assign.default)({
    id: null,
    pid: null,
    leaf: false,
    depth: 1
  }, data, defaults);

  if (node.id == null) {
    node.id = 'node_' + id++;
  }

  ;
  return node;
}