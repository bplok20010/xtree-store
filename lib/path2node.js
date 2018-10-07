
"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = path2node;

var _isArray = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/array/is-array"));

var _create = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/create"));

/**
 * 
 * @param {array|string} paths [paths=[]] 
 * @param {string} sep [sep='/']
 * @param {string|number} rootId [rootId=null]
 * @return {array}
 * 
 * @example
 * path2node(["A/B/C", "A/B/D",, "A/E/C"]);
 */
function path2node() {
  var paths = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  var sep = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '/';
  var rootId = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  var nodes = [];
  var map = (0, _create.default)(null);
  paths = (0, _isArray.default)(paths) ? paths : [paths];
  paths.forEach(function (path) {
    if (path == null) return;
    path += '';
    var pathArray = path.split(sep);
    var pid = rootId;

    for (var i = 0; i < pathArray.length; i++) {
      var label = pathArray[i];
      var id = pathArray.slice(0, i + 1).join(sep);

      if (!map[id]) {
        var node = {
          id: id,
          pid: pid,
          label: label
        };
        nodes.push(node);
        map[id] = node;
      }

      pid = id;
    }
  });
  return nodes;
}