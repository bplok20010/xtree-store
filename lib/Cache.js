
"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _create = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/create"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/createClass"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/defineProperty"));

var Cache =
/*#__PURE__*/
function () {
  function Cache() {
    (0, _classCallCheck2.default)(this, Cache);
    (0, _defineProperty2.default)(this, "_caches", (0, _create.default)(null));
  }

  (0, _createClass2.default)(Cache, [{
    key: "set",
    value: function set(key, value) {
      this._caches[key] = value;
    }
  }, {
    key: "get",
    value: function get(key) {
      return this._caches[key];
    }
  }, {
    key: "has",
    value: function has(key) {
      return key in this._caches;
    }
  }, {
    key: "delete",
    value: function _delete(key) {
      delete this._caches[key];
    }
  }, {
    key: "clear",
    value: function clear() {
      this._caches = (0, _create.default)(null);
    }
  }]);
  return Cache;
}();

exports.default = Cache;