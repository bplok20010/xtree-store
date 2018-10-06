
"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/toConsumableArray"));

var _isArray = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/array/is-array"));

var _assign = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/assign"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/createClass"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/defineProperty"));

var _normalize = _interopRequireDefault(require("./normalize"));

var _utils = require("./utils");

var TreeStore =
/*#__PURE__*/
function () {
  (0, _createClass2.default)(TreeStore, null, [{
    key: "clone",
    value: function clone(store) {
      var newStore = new TreeStore([], store.options);
      newStore.__NodeList = store.__NodeList.map(function (v) {
        return v;
      });
      newStore.__NodeMap = (0, _assign.default)({}, store.__NodeMap);
      return newStore;
    }
  }, {
    key: "create",
    value: function create(data, options) {
      return new TreeStore(data, options);
    }
  }]);

  function TreeStore(data, options) {
    (0, _classCallCheck2.default)(this, TreeStore);
    (0, _defineProperty2.default)(this, "options", {});
    (0, _defineProperty2.default)(this, "__NodeList", []);
    (0, _defineProperty2.default)(this, "__NodeMap", {});
    (0, _defineProperty2.default)(this, "__root", {});
    this.options = (0, _assign.default)({
      rootId: null,
      simpleMode: false,
      idField: 'id',
      pidField: 'pid',
      childrenField: 'children',
      processNode: null
    }, options);
    this.__root = (0, _normalize.default)({
      depth: 0,
      leaf: false,
      pid: null,
      root: true
    });
    this.__root.id = this.options.rootId;
    this.__NodeList = [];
    this.__NodeMap = {};
    this.setData(data);
  }

  (0, _createClass2.default)(TreeStore, [{
    key: "isSimpleMode",
    value: function isSimpleMode() {
      return this.options.simpleMode;
    }
  }, {
    key: "getRootId",
    value: function getRootId() {
      return this.options.rootId;
    }
  }, {
    key: "isRoot",
    value: function isRoot(id) {
      return (0, _utils.isEqual)(id, this.getRootId());
    }
  }, {
    key: "setData",
    value: function setData(data, pid) {
      pid = (0, _utils.undef)(pid, this.options.rootId);
      data = (0, _isArray.default)(data) ? data : [data];
      if (!data.length) return;

      if (this.isSimpleMode()) {
        this._parseSimpleData(data, pid);
      } else {
        this._parseData(data, pid);
      }
    }
  }, {
    key: "_parseData",
    value: function _parseData(data, pid) {
      var _this$options = this.options,
          idField = _this$options.idField,
          childrenField = _this$options.childrenField,
          processNode = _this$options.processNode;
      var NodeList = this.__NodeList;
      var NodeMap = this.__NodeMap;

      var walkNodes = function walkNodes(node, pid) {
        var depth = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;

        if (processNode) {
          node = processNode(node);
        }

        var id = node[idField];
        var children = node[childrenField];
        node = (0, _normalize.default)(node, {
          id: id,
          pid: pid,
          depth: depth,
          leaf: !(0, _isArray.default)(children)
        });
        delete node[childrenField];
        NodeList.push(node);
        NodeMap[id] = node;

        if ((0, _isArray.default)(children)) {
          children.forEach(function (node) {
            return walkNodes(node, id, depth + 1);
          });
        }
      };

      data.forEach(function (node) {
        return walkNodes(node, pid, 1);
      });
    }
  }, {
    key: "_parseSimpleData",
    value: function _parseSimpleData(data, pid) {
      var _this$options2 = this.options,
          idField = _this$options2.idField,
          pidField = _this$options2.pidField,
          processNode = _this$options2.processNode;
      var NodeList = this.__NodeList;
      var NodeMap = this.__NodeMap;
      data.forEach(function (node) {
        if (processNode) {
          node = processNode(node);
        }

        var id = node[idField];
        var pid = node[pidField];
        node = (0, _normalize.default)(node, {
          id: id,
          pid: pid
        });
        NodeList.push(node);
        NodeMap[id] = node;
      }); //update depth

      this._updateDepth(pid);
    }
  }, {
    key: "_updateDepth",
    value: function _updateDepth(id) {
      var _this = this;

      id = (0, _utils.undef)(id, this.getRootId());
      var node = this.getNode(id);
      var pDepth = node ? node.depth : 0;
      var childNodes = this.getChildren(id);

      if (node) {
        if ((0, _utils.isUndefined)(node.leaf)) {
          node.leaf = !childNodes.length;
        }
      }

      childNodes.forEach(function (node) {
        node.depth = pDepth + 1;

        _this._updateDepth(node.id);
      });
    }
  }, {
    key: "getRootNode",
    value: function getRootNode() {
      return this.__root;
    }
  }, {
    key: "getNode",
    value: function getNode(id) {
      var NodeMap = this.__NodeMap;
      if (this.isRoot(id)) return this.getRootNode();
      return id in NodeMap ? NodeMap[id] : null;
    }
  }, {
    key: "getDepth",
    value: function getDepth(id) {
      var node = this.getNode(id);
      return node ? node.depth : 0;
    }
  }, {
    key: "getMaxDepth",
    value: function getMaxDepth() {
      var depth = 0;

      this.__NodeList.forEach(function (node) {
        depth = Math.max(node.depth, depth);
      });

      return depth;
    }
  }, {
    key: "isLeaf",
    value: function isLeaf(id) {
      var node = this.getNode(id);
      return node ? node.leaf : true;
    }
  }, {
    key: "getDepthNodes",
    value: function getDepthNodes() {
      var depth = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

      if (depth < 1) {
        return this.getRootNode();
      }

      return this.__NodeList.filter(function (node) {
        return node.depth === depth;
      });
    }
  }, {
    key: "getChildren",
    value: function getChildren(id) {
      id = (0, _utils.undef)(id, this.getRootId());
      return this.isLeaf(id) ? [] : this.__NodeList.filter(function (node) {
        return (0, _utils.isEqual)(node.pid, id);
      });
    }
  }, {
    key: "getAllChildren",
    value: function getAllChildren(id) {
      var _this2 = this;

      var childs = this.getChildren(id);
      var results = [];
      childs.forEach(function (node) {
        results.push(node);
        results.push.apply(results, (0, _toConsumableArray2.default)(_this2.getAllChildren(node.id)));
      });
      return results;
    }
  }, {
    key: "getParentNode",
    value: function getParentNode(id) {
      id = (0, _utils.undef)(id, this.getRootId());
      var node = this.getNode(id);
      return node ? this.isRoot(node.pid) ? null : this.getNode(node.pid) : null;
    }
  }, {
    key: "getParentNodes",
    value: function getParentNodes(id) {
      var pNodes = [];
      var pNode;

      while (pNode = this.getParentNode(id)) {
        pNodes.push(pNode);
        id = pNode.id;
      }

      return pNodes;
    }
  }, {
    key: "getParentIds",
    value: function getParentIds(id) {
      return this.getParentNodes(id).map(function (node) {
        return node.id;
      });
    }
  }]);
  return TreeStore;
}();

exports.default = TreeStore;