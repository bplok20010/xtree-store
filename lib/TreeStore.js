
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

var _cloneStore = _interopRequireDefault(require("./cloneStore"));

var _Cache = _interopRequireDefault(require("./Cache"));

var _utils = require("./utils");

var TreeStore =
/*#__PURE__*/
function () {
  function TreeStore(data, options) {
    (0, _classCallCheck2.default)(this, TreeStore);
    (0, _defineProperty2.default)(this, "options", {});
    (0, _defineProperty2.default)(this, "__NodeList", []);
    (0, _defineProperty2.default)(this, "__NodeMap", {});
    (0, _defineProperty2.default)(this, "__root", {});
    (0, _defineProperty2.default)(this, "__init", true);
    (0, _defineProperty2.default)(this, "_cache", new _Cache.default());
    this.options = (0, _assign.default)({
      rootId: null,
      simpleData: false,
      idField: 'id',
      pidField: 'pid',
      childrenField: 'children',
      processNode: null,
      resolveChildren: null,
      cache: true
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
    this.__init = false;
  }

  (0, _createClass2.default)(TreeStore, [{
    key: "_getChildrenCacheKey",
    value: function _getChildrenCacheKey(id) {
      return id + '_children';
    }
  }, {
    key: "clearCache",
    value: function clearCache() {
      this._cache.clear();
    }
  }, {
    key: "isSimpleData",
    value: function isSimpleData() {
      return this.options.simpleData;
    }
  }, {
    key: "getNodeList",
    value: function getNodeList() {
      return this.__NodeList;
    }
  }, {
    key: "getNodeMap",
    value: function getNodeMap() {
      return this.__NodeMap;
    }
  }, {
    key: "getRootId",
    value: function getRootId() {
      return this.options.rootId;
    }
  }, {
    key: "hasNode",
    value: function hasNode(id) {
      return this.__NodeMap.hasOwnProperty(id + '');
    }
  }, {
    key: "isRoot",
    value: function isRoot(id) {
      return (0, _utils.isEqual)(id, this.getRootId());
    }
  }, {
    key: "setData",
    value: function setData(data, pid) {
      var insert = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
      pid = (0, _utils.undef)(pid, this.options.rootId);
      data = (0, _isArray.default)(data) ? data : [data];
      if (!data.length) return [];

      if (this.isSimpleData()) {
        return this._parseSimpleData(data, pid, insert);
      } else {
        return this._parseData(data, pid, insert);
      }
    }
  }, {
    key: "_parseData",
    value: function _parseData(data, pid) {
      var _this = this;

      var insert = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
      var _this$options = this.options,
          idField = _this$options.idField,
          childrenField = _this$options.childrenField,
          processNode = _this$options.processNode,
          useCache = _this$options.cache;
      var NodeList = this.__NodeList;
      var NodeMap = this.__NodeMap;
      var isInit = this.__init;
      var pNode = this.getNode(pid);
      var results = [];
      var pIds = [pid];
      if (!pNode) return results;

      var walkNodes = function walkNodes(node, pid) {
        var depth = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;

        if (processNode) {
          node = processNode(node);
        }

        var id = node[idField];
        var children = node[childrenField];
        var leaf = node.leaf;

        if ((0, _utils.isUndefined)(leaf)) {
          leaf = (0, _utils.isUndefined)(children);
        }

        node = (0, _normalize.default)(node, {
          id: id,
          pid: pid,
          depth: depth,
          leaf: leaf
        });
        delete node[childrenField];

        if (!_this.hasNode(id)) {
          results.push(node);
          insert && NodeList.push(node);
          NodeMap[id] = node;
        }

        if (!leaf && (0, _isArray.default)(children)) {
          children.forEach(function (node) {
            return walkNodes(node, id, depth + 1);
          });
        }

        if (!leaf) {
          pIds.push(id);
        }
      };

      data.forEach(function (node) {
        return walkNodes(node, pNode.id, pNode.depth + 1);
      });

      if (!isInit && useCache) {
        pIds.forEach(function (pid) {
          return _this._cache.delete(_this._getChildrenCacheKey(pid));
        });
      }

      return results;
    }
  }, {
    key: "_parseSimpleData",
    value: function _parseSimpleData(data, pid) {
      var _this2 = this;

      var insert = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
      var _this$options2 = this.options,
          idField = _this$options2.idField,
          pidField = _this$options2.pidField,
          processNode = _this$options2.processNode,
          useCache = _this$options2.cache;
      var NodeList = this.__NodeList;
      var NodeMap = this.__NodeMap;
      var pNode = this.getNode(pid);
      var isInit = this.__init;
      var results = [];
      if (!pNode) return results;
      data.forEach(function (node) {
        if (processNode) {
          node = processNode(node);
        }

        var id = node[idField];
        var pid = (0, _utils.undef)(node[pidField], pNode.id);
        node = (0, _normalize.default)(node, {
          id: id,
          pid: pid
        });

        if (!_this2.hasNode(id)) {
          results.push(node);
          insert && NodeList.push(node);
          NodeMap[id] = node;
        }
      });

      if (!isInit && useCache) {
        this._clearCacheByPID(pNode.id);
      } //update depth


      insert && this._updateDepth(pNode.id);
      return results;
    }
  }, {
    key: "_updateDepth",
    value: function _updateDepth(id) {
      var _this3 = this;

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

        _this3._updateDepth(node.id);
      });
    }
  }, {
    key: "_clearCacheByPID",
    value: function _clearCacheByPID(pid) {
      var _this4 = this;

      var childs = this.getAllChildren(pid);

      this._cache.delete(this._getChildrenCacheKey(pid));

      childs.forEach(function (node) {
        _this4._cache.delete(_this4._getChildrenCacheKey(node.id));
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
    key: "getNodeIndex",
    value: function getNodeIndex(id) {
      if (this.isRoot(id)) return -1;
      var NodeList = this.__NodeList;
      var index = -1;

      for (var i = 0; i < NodeList.length; i++) {
        var node = NodeList[i];

        if ((0, _utils.isEqual)(node.id, id)) {
          index = i;
          break;
        }
      }

      return index;
    }
  }, {
    key: "indexOf",
    value: function indexOf(id) {
      return this.getNodeIndex(id);
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
    key: "getFirstChild",
    value: function getFirstChild(pid) {
      var childs = this.getChildren(pid);
      return childs.shift();
    }
  }, {
    key: "getLastChild",
    value: function getLastChild(pid) {
      var childs = this.getChildren(pid);
      return childs.pop();
    }
  }, {
    key: "isFirstChild",
    value: function isFirstChild(id) {
      if (this.isRoot(id)) return true;
      var node = this.getNode(id);
      if (!node) return false;
      return node === this.getFirstChild(node.pid);
    }
  }, {
    key: "isLastChild",
    value: function isLastChild(id) {
      if (this.isRoot(id)) return true;
      var node = this.getNode(id);
      if (!node) return false;
      return node === this.getLastChild(node.pid);
    }
  }, {
    key: "getDepthNodes",
    value: function getDepthNodes() {
      var depth = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

      if (depth < 1) {
        return [this.getRootNode()];
      }

      return this.__NodeList.filter(function (node) {
        return node.depth === depth;
      });
    }
  }, {
    key: "getDepthIds",
    value: function getDepthIds(depth) {
      return this.getDepthNodes(depth).map(function (node) {
        return node.id;
      });
    }
  }, {
    key: "getChildren",
    value: function getChildren(id) {
      var key = this._getChildrenCacheKey(id);

      var _this$options3 = this.options,
          useCache = _this$options3.useCache,
          resolveChildren = _this$options3.resolveChildren;

      if (useCache && this._cache.has(key)) {
        return this._cache.get(key);
      }

      id = (0, _utils.undef)(id, this.getRootId());
      var results = this.isLeaf(id) ? [] : this.__NodeList.filter(function (node) {
        return (0, _utils.isEqual)(node.pid, id);
      });

      if (resolveChildren) {
        results = resolveChildren(results);
      }

      if (useCache) {
        this._cache.set(key, results);
      }

      return results;
    }
  }, {
    key: "getChildrenIds",
    value: function getChildrenIds(id) {
      return this.getChildren(id).map(function (node) {
        return node.id;
      });
    }
  }, {
    key: "getAllChildren",
    value: function getAllChildren(id) {
      var _this5 = this;

      var childs = this.getChildren(id);
      var results = [];
      childs.forEach(function (node) {
        results.push(node);
        results.push.apply(results, (0, _toConsumableArray2.default)(_this5.getAllChildren(node.id)));
      });
      return results;
    }
  }, {
    key: "getAllChildrenIds",
    value: function getAllChildrenIds(id) {
      return this.getAllChildren(id).map(function (node) {
        return node.id;
      });
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
        pNodes.unshift(pNode);
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
  }, {
    key: "getPath",
    value: function getPath(id) {
      var field = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'id';
      var sep = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '/';
      var node = this.getNode(id);
      if (this.isRoot(id) || !node) return '';
      var nodes = this.getParentNodes(id).concat(node);
      return nodes.map(function (node) {
        return node[field];
      }).join(sep);
    }
  }, {
    key: "_saveMode",
    value: function _saveMode() {
      this.__saveMode = this.options.simpleData;
    }
  }, {
    key: "_restoreMode",
    value: function _restoreMode() {
      if (!(0, _utils.isUndefined)(this.__saveMode)) {
        this.options.simpleData = this.__saveMode;
        this.__saveMode = undefined;
      }
    }
  }, {
    key: "appendChild",
    value: function appendChild(data, pid) {
      var simpleData = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.options.simpleData;
      var pNode = this.getNode(pid);
      if (!pNode) return;
      pNode.leaf = false;

      this._saveMode();

      this.options.simpleData = simpleData;
      this.setData(data, pid);

      this._restoreMode();
    }
  }, {
    key: "prependChild",
    value: function prependChild(node, pid) {
      var simpleData = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.options.simpleData;
      var pNode = this.getNode(pid);
      if (!pNode) return;
      pNode.leaf = false;
      var pIndex = this.getNodeIndex(pid);
      if (pIndex < 0) return;

      this._saveMode();

      this.options.simpleData = simpleData;
      var NodeList = this.getNodeList();
      var results = this.setData(node, pid, false);

      if (results.length) {
        NodeList.splice.apply(NodeList, [pIndex, 1].concat((0, _toConsumableArray2.default)([NodeList[pIndex]].concat(results))));
        if (this.isSimpleData()) this._updateDepth(pid);
      }

      this._restoreMode();
    }
  }, {
    key: "insertBefore",
    value: function insertBefore(node, id) {
      var simpleData = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.options.simpleData;
      var index = this.getNodeIndex(id);
      if (index < 0) return;
      var pNode = this.getParentNode(id);

      this._saveMode();

      this.options.simpleData = simpleData;
      var NodeList = this.getNodeList();
      var results = this.setData(node, pNode.id, false);

      if (results.length) {
        NodeList.splice.apply(NodeList, [index, 0].concat((0, _toConsumableArray2.default)(results)));
        if (this.isSimpleData()) this._updateDepth(pNode.id);
      }

      this._restoreMode();
    }
  }, {
    key: "insertAfter",
    value: function insertAfter(node, id, simpleData) {
      var index = this.getNodeIndex(id);
      if (index < 0) return;
      var pNode = this.getParentNode(id);

      this._saveMode();

      this.options.simpleData = simpleData;
      var NodeList = this.getNodeList();
      var results = this.setData(node, pNode.id, false);

      if (results.length) {
        NodeList.splice.apply(NodeList, [index, 1].concat((0, _toConsumableArray2.default)([NodeList[index]].concat(results))));
        if (this.isSimpleData()) this._updateDepth(pNode.id);
      }

      this._restoreMode();
    }
  }, {
    key: "removeNode",
    value: function removeNode(id) {
      var _this6 = this;

      var index = this.getNodeIndex(id);
      var childs = this.getAllChildren(id);
      var NodeList = this.getNodeList();
      var NodeMap = this.getNodeMap();

      if (index >= 0) {
        NodeList.splice(index, 1);
        delete NodeMap[id];
        childs.forEach(function (node) {
          var idx = _this6.getNodeIndex(node.id);

          if (idx >= 0) {
            NodeList.splice(index, 1);
            delete NodeMap[id];
          }
        });
      }
    }
  }, {
    key: "replaceNode",
    value: function replaceNode(node, id, simpleData) {
      var index = this.getNodeIndex(id);
      if (index < 0) return;
      var pNode = this.getParentNode(id);
    }
  }, {
    key: "toData",
    value: function toData() {
      var _this7 = this;

      var childField = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'children';

      var copyChilds = function copyChilds(pid) {
        return _this7.getChildren(pid).map(function (node) {
          return (0, _assign.default)({}, node);
        });
      };

      var nodes = copyChilds(this.getRootId());

      var walkNodes = function walkNodes(node) {
        delete node.pid;

        if (!_this7.isLeaf(node.id)) {
          var childNodes = copyChilds(node.id);
          node[childField] = childNodes;
          childNodes.forEach(walkNodes);
        }
      };

      nodes.forEach(walkNodes);
      return nodes;
    }
  }, {
    key: "toSimpleData",
    value: function toSimpleData() {
      return this.getNodeList().map(function (node) {
        return (0, _assign.default)({}, node);
      });
    }
  }, {
    key: "toPaths",
    value: function toPaths() {
      var _this8 = this;

      var field = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'id';
      var sep = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '/';
      return this.getAllChildren(this.getRootId()).filter(function (node) {
        return _this8.isLeaf(node.id);
      }).map(function (node) {
        return _this8.getPath(node.id, field, sep);
      });
    }
  }, {
    key: "toAllPaths",
    value: function toAllPaths() {
      var _this9 = this;

      var field = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'id';
      var sep = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '/';
      return this.getNodeList().map(function (node) {
        return _this9.getPath(node.id, field, sep);
      });
    }
  }, {
    key: "clone",
    value: function clone() {
      return (0, _cloneStore.default)(this);
    }
  }]);
  return TreeStore;
}();

exports.default = TreeStore;