import normalize from "./normalize";
import cloneStore from "./cloneStore";
import Cache from "./Cache";
import { isEqual, isUndefined, undef } from "./utils";

export default class TreeStore {
    options = {};
    __NodeList = [];
    __NodeMap = {};
    __root = {};
    __init = true;
    _cache = new Cache();

    constructor(data, options) {
        this.options = {
            rootId: null,
            simpleData: false,
            idField: "id",
            pidField: "pid",
            childrenField: "children",
            processNode: null,
            resolveChildren: null,
            cache: true,
            ...options
        };

        this.__root = normalize({
            depth: 0,
            leaf: false,
            pid: null,
            root: true
        });
        this.__root.id = this.options.rootId;

        this.__NodeList = [];
        this.__NodeMap = {};

        if (data) {
            this.setData(data);
        }

        this.__init = false;
    }

    _getChildrenCacheKey(id) {
        return id + "_children";
    }

    clearCache() {
        this._cache.clear();
    }

    isSimpleData() {
        return this.options.simpleData;
    }

    getNodeList() {
        return this.__NodeList;
    }

    getNodeMap() {
        return this.__NodeMap;
    }

    getRootId() {
        return this.options.rootId;
    }

    hasNode(id) {
        return this.__NodeMap.hasOwnProperty(id + "");
    }

    isRoot(id) {
        return isEqual(id, this.getRootId());
    }

    setData(data, pid, insert = true) {
        pid = undef(pid, this.options.rootId);

        data = Array.isArray(data) ? data : [data];

        if (!data.length) return [];

        if (this.isSimpleData()) {
            return this._parseSimpleData(data, pid, insert);
        } else {
            return this._parseData(data, pid, insert);
        }
    }

    _parseData(data, pid, insert = true) {
        const {
            idField,
            childrenField,
            processNode,
            cache: useCache
        } = this.options;
        const NodeList = this.__NodeList;
        const NodeMap = this.__NodeMap;
        const isInit = this.__init;
        const pNode = this.getNode(pid);
        const results = [];
        const pIds = [pid];
        if (!pNode) return results;

        const walkNodes = (node, pid, depth = 1) => {
            if (processNode) {
                node = processNode(node);
            }

            const id = node[idField];
            const children = node[childrenField];

            let leaf = node.leaf;
            if (isUndefined(leaf)) {
                leaf = isUndefined(children);
            }

            node = normalize(node, {
                id,
                pid,
                depth,
                leaf
            });

            delete node[childrenField];

            if (!this.hasNode(id)) {
                results.push(node);
                insert && NodeList.push(node);
                NodeMap[id] = node;
            }

            if (!leaf && Array.isArray(children)) {
                children.forEach(node => walkNodes(node, id, depth + 1));
            }

            if (!leaf) {
                pIds.push(id);
            }
        };

        data.forEach(node => walkNodes(node, pNode.id, pNode.depth + 1));

        if (!isInit && useCache) {
            pIds.forEach(pid =>
                this._cache.delete(this._getChildrenCacheKey(pid))
            );
        }

        return results;
    }

    _parseSimpleData(data, pid, insert = true) {
        const {
            idField,
            pidField,
            processNode,
            cache: useCache
        } = this.options;
        const NodeList = this.__NodeList;
        const NodeMap = this.__NodeMap;
        const pNode = this.getNode(pid);
        const isInit = this.__init;
        const results = [];

        if (!pNode) return results;

        data.forEach(node => {
            if (processNode) {
                node = processNode(node);
            }

            const id = node[idField];
            const pid = undef(node[pidField], pNode.id);

            node = normalize(node, {
                id,
                pid
            });

            if (!this.hasNode(id)) {
                results.push(node);
                insert && NodeList.push(node);
                NodeMap[id] = node;
            }
        });

        if (!isInit && useCache) {
            this._clearCacheByPID(pNode.id);
        }

        //update depth
        insert && this._updateDepth(pNode.id);

        return results;
    }

    _updateDepth(id) {
        id = undef(id, this.getRootId());
        const node = this.getNode(id);
        const pDepth = node ? node.depth : 0;
        const childNodes = this.getChildren(id);

        if (node) {
            if (isUndefined(node.leaf)) {
                node.leaf = !childNodes.length;
            }
        }

        childNodes.forEach(node => {
            node.depth = pDepth + 1;
            this._updateDepth(node.id);
        });
    }

    _clearCacheByPID(pid) {
        const childs = this.getAllChildren(pid);
        this._cache.delete(this._getChildrenCacheKey(pid));

        childs.forEach(node => {
            this._cache.delete(this._getChildrenCacheKey(node.id));
        });
    }

    getRootNode() {
        return this.__root;
    }

    getNode(id) {
        const NodeMap = this.__NodeMap;

        if (this.isRoot(id)) return this.getRootNode();

        return id in NodeMap ? NodeMap[id] : null;
    }

    getNodeIndex(id) {
        if (this.isRoot(id)) return -1;
        const NodeList = this.__NodeList;
        let index = -1;
        for (let i = 0; i < NodeList.length; i++) {
            const node = NodeList[i];
            if (isEqual(node.id, id)) {
                index = i;
                break;
            }
        }

        return index;
    }

    indexOf(id) {
        return this.getNodeIndex(id);
    }

    getDepth(id) {
        const node = this.getNode(id);
        return node ? node.depth : 0;
    }

    getMaxDepth() {
        let depth = 0;

        this.__NodeList.forEach(node => {
            depth = Math.max(node.depth, depth);
        });

        return depth;
    }

    isLeaf(id) {
        const node = this.getNode(id);
        return node ? node.leaf : true;
    }

    getFirstChild(pid) {
        const childs = this.getChildren(pid);
        return childs.shift();
    }

    getLastChild(pid) {
        const childs = this.getChildren(pid);
        return childs.pop();
    }

    isFirstChild(id) {
        if (this.isRoot(id)) return true;
        const node = this.getNode(id);
        if (!node) return false;

        return node === this.getFirstChild(node.pid);
    }

    isLastChild(id) {
        if (this.isRoot(id)) return true;
        const node = this.getNode(id);
        if (!node) return false;

        return node === this.getLastChild(node.pid);
    }

    getDepthNodes(depth = 1) {
        if (depth < 1) {
            return [this.getRootNode()];
        }
        return this.__NodeList.filter(node => node.depth === depth);
    }

    getDepthIds(depth) {
        return this.getDepthNodes(depth).map(node => node.id);
    }

    getChildren(id) {
        const key = this._getChildrenCacheKey(id);
        const { useCache, resolveChildren } = this.options;

        if (useCache && this._cache.has(key)) {
            return this._cache.get(key);
        }

        id = undef(id, this.getRootId());
        let results = this.isLeaf(id)
            ? []
            : this.__NodeList.filter(node => isEqual(node.pid, id));

        if (resolveChildren) {
            results = resolveChildren(results);
        }

        if (useCache) {
            this._cache.set(key, results);
        }

        return results;
    }

    getChildrenIds(id) {
        return this.getChildren(id).map(node => node.id);
    }

    getAllChildren(id) {
        const childs = this.getChildren(id);
        const results = [];

        childs.forEach(node => {
            results.push(node);
            results.push(...this.getAllChildren(node.id));
        });

        return results;
    }

    getAllChildrenIds(id) {
        return this.getAllChildren(id).map(node => node.id);
    }

    getParentNode(id) {
        id = undef(id, this.getRootId());
        const node = this.getNode(id);

        return node
            ? this.isRoot(node.pid)
                ? null
                : this.getNode(node.pid)
            : null;
    }

    getParentNodes(id) {
        const pNodes = [];
        let pNode;

        while ((pNode = this.getParentNode(id))) {
            pNodes.unshift(pNode);
            id = pNode.id;
        }

        return pNodes;
    }

    getParentIds(id) {
        return this.getParentNodes(id).map(node => node.id);
    }

    getPath(id, field = "id", sep = "/") {
        const node = this.getNode(id);

        if (this.isRoot(id) || !node) return "";
        const nodes = this.getParentNodes(id).concat(node);

        return nodes.map(node => node[field]).join(sep);
    }

    _saveMode() {
        this.__saveMode = this.options.simpleData;
    }

    _restoreMode() {
        if (!isUndefined(this.__saveMode)) {
            this.options.simpleData = this.__saveMode;
            this.__saveMode = undefined;
        }
    }

    appendChild(data, pid, simpleData = this.options.simpleData) {
        const pNode = this.getNode(pid);
        if (!pNode) return;

        pNode.leaf = false;

        this._saveMode();
        this.options.simpleData = simpleData;

        this.setData(data, pid);

        this._restoreMode();
    }

    prependChild(node, pid, simpleData = this.options.simpleData) {
        const pNode = this.getNode(pid);
        if (!pNode) return;

        pNode.leaf = false;

        const pIndex = this.getNodeIndex(pid);
        if (pIndex < 0) return;

        this._saveMode();
        this.options.simpleData = simpleData;

        const NodeList = this.getNodeList();
        const results = this.setData(node, pid, false);

        if (results.length) {
            NodeList.splice(pIndex, 1, ...[NodeList[pIndex]].concat(results));
            if (this.isSimpleData()) this._updateDepth(pid);
        }

        this._restoreMode();
    }

    insertBefore(node, id, simpleData = this.options.simpleData) {
        const index = this.getNodeIndex(id);
        if (index < 0) return;

        const pNode = this.getParentNode(id);

        this._saveMode();
        this.options.simpleData = simpleData;

        const NodeList = this.getNodeList();
        const results = this.setData(node, pNode.id, false);
        if (results.length) {
            NodeList.splice(index, 0, ...results);
            if (this.isSimpleData()) this._updateDepth(pNode.id);
        }

        this._restoreMode();
    }

    insertAfter(node, id, simpleData) {
        const index = this.getNodeIndex(id);
        if (index < 0) return;

        const pNode = this.getParentNode(id);

        this._saveMode();
        this.options.simpleData = simpleData;

        const NodeList = this.getNodeList();
        const results = this.setData(node, pNode.id, false);
        if (results.length) {
            NodeList.splice(index, 1, ...[NodeList[index]].concat(results));
            if (this.isSimpleData()) this._updateDepth(pNode.id);
        }

        this._restoreMode();
    }

    removeNode(id) {
        const index = this.getNodeIndex(id);
        const childs = this.getAllChildren(id);
        const NodeList = this.getNodeList();
        const NodeMap = this.getNodeMap();
        const removeNode = NodeList[index];

        if (index >= 0) {
            NodeList.splice(index, 1);
            delete NodeMap[id];

            //if (!this.isLeaf(removeNode.id)) {
            this._cache.delete(this._getChildrenCacheKey(removeNode.id));
            //}

            childs.forEach(node => {
                const idx = this.getNodeIndex(node.id);
                if (idx >= 0) {
                    NodeList.splice(index, 1);
                    delete NodeMap[id];
                }

                //if (!this.isLeaf(node.id)) {
                this._cache.delete(this._getChildrenCacheKey(node.id));
                //}
            });
        }
    }

    replaceNode(node, id, simpleData) {
        const oldNode = this.getNode(id);
        if (!oldNode) return;

        if (this.isRoot(id)) return;

        const pNode = this.getParentNode(id);
        const siblings = this.getChildren(pNode.id);
        const index = siblings.indexOf(oldNode);
        const prevNode = index === -1 ? null : siblings[index - 1];

        this.removeNode(oldNode.id);

        if (prevNode) {
            this.insertAfter(node, prevNode.id, simpleData);
        } else {
            this.prependChild(node, pNode.id, simpleData);
        }
    }

    removeAllNode() {
        this.__NodeList = [];
        this.__NodeMap = {};
        this.clearCache();
    }

    toData(childField = "children") {
        const copyChilds = pid =>
            this.getChildren(pid).map(node => ({ ...node }));

        const nodes = copyChilds(this.getRootId());

        const walkNodes = node => {
            delete node.pid;
            if (!this.isLeaf(node.id)) {
                const childNodes = copyChilds(node.id);
                node[childField] = childNodes;
                childNodes.forEach(walkNodes);
            }
        };

        nodes.forEach(walkNodes);

        return nodes;
    }

    toSimpleData() {
        return this.getNodeList().map(node => ({ ...node }));
    }

    toPaths(field = "id", sep = "/") {
        return this.getAllChildren(this.getRootId())
            .filter(node => this.isLeaf(node.id))
            .map(node => this.getPath(node.id, field, sep));
    }

    toAllPaths(field = "id", sep = "/") {
        return this.getNodeList().map(node =>
            this.getPath(node.id, field, sep)
        );
    }

    clone() {
        return cloneStore(this);
    }
}
