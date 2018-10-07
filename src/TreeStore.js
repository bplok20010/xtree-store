import normalize from './normalize';
import cloneStore from './cloneStore';
import {
    isEqual,
    isUndefined,
    undef,
} from './utils';

export default class TreeStore {
    options = {};
    __NodeList = [];
    __NodeMap = {};
    __root = {};

    constructor(data, options) {
        this.options = Object.assign({
            rootId: null,
            simpleMode: false,
            idField: 'id',
            pidField: 'pid',
            childrenField: 'children',
            processNode: null,
        }, options);

        this.__root = normalize({
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

    isSimpleMode() {
        return this.options.simpleMode;
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
        return this.__NodeMap.hasOwnProperty(id + '');
    }

    isRoot(id) {
        return isEqual(id, this.getRootId());
    }

    setData(data, pid, insert = true) {
        pid = undef(pid, this.options.rootId);

        data = Array.isArray(data) ? data : [data];

        if (!data.length) return [];

        if (this.isSimpleMode()) {
            return this._parseSimpleData(data, pid, insert);
        } else {
            return this._parseData(data, pid, insert);
        }
    }

    _parseData(data, pid, insert = true) {
        const { idField, childrenField, processNode } = this.options;
        const NodeList = this.__NodeList;
        const NodeMap = this.__NodeMap;
        const pNode = this.getNode(pid);
        const results = [];

        if (!pNode) return results;

        const walkNodes = (node, pid, depth = 1) => {
            if (processNode) {
                node = processNode(node);
            }

            const id = node[idField];
            const children = node[childrenField];

            node = normalize(node, {
                id,
                pid,
                depth,
                leaf: !Array.isArray(children)
            });

            delete node[childrenField];

            if (!this.hasNode(id)) {
                results.push(node);
                insert && NodeList.push(node);
                NodeMap[id] = node;
            }

            if (Array.isArray(children)) {
                children.forEach(node => walkNodes(node, id, depth + 1));
            }
        }

        data.forEach(node => walkNodes(node, pNode.id, pNode.depth + 1));

        return results;
    }

    _parseSimpleData(data, pid, insert = true) {
        const { idField, pidField, processNode } = this.options;
        const NodeList = this.__NodeList;
        const NodeMap = this.__NodeMap;
        const pNode = this.getNode(pid);
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
                pid,
            });

            if (!this.hasNode(id)) {
                results.push(node);
                insert && NodeList.push(node);
                NodeMap[id] = node;
            }
        });

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
        const node = this.getNode();
        if (!node) return false;

        return node === this.getFirstChild(node.pid);
    }

    isLastChild(id) {
        if (this.isRoot(id)) return true;
        const node = this.getNode();
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
        return this.getDepthNodes(depth).map(node => node.id)
    }

    getChildren(id) {
        id = undef(id, this.getRootId());
        return this.isLeaf(id) ?
            [] :
            this.__NodeList.filter(node => isEqual(node.pid, id));
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

        return node ?
            (
                this.isRoot(node.pid) ?
                    null :
                    this.getNode(node.pid)
            ) :
            null;
    }

    getParentNodes(id) {
        const pNodes = [];
        let pNode;

        while (pNode = this.getParentNode(id)) {
            pNodes.unshift(pNode);
            id = pNode.id;
        }

        return pNodes;
    }

    getParentIds(id) {
        return this.getParentNodes(id).map(node => node.id);
    }

    getPath(id, field = 'id', sep = '/') {
        const node = this.getNode(id);

        if (this.isRoot(id) || !node) return '';
        const nodes = this.getParentNodes(id).concat(node);

        return nodes.map(node => node[field]).join(sep);
    }

    _saveMode() {
        this.__saveMode = this.options.simpleMode;
    }

    _restoreMode() {
        if (!isUndefined(this.__saveMode)) {
            this.options.simpleMode = this.__saveMode;
            this.__saveMode = undefined;
        }
    }

    appendChild(data, pid, simpleMode = this.options.simpleMode) {
        this._saveMode();
        this.options.simpleMode = simpleMode;

        this.setData(data, pid);

        this._restoreMode();
    }

    prependChild(node, pid, simpleMode = this.options.simpleMode) {
        const pIndex = this.getNodeIndex(pid);
        if (pIndex < 0) return;

        this._saveMode();
        this.options.simpleMode = simpleMode;

        const NodeList = this.getNodeList();
        const results = this.setData(node, pid, false);

        if (results.length) {
            NodeList.splice(pIndex, 1, ...[NodeList[pIndex]].concat(results));
            if (this.isSimpleMode())
                this._updateDepth(pid);
        }

        this._restoreMode();
    }

    insertBefore(node, id, simpleMode = this.options.simpleMode) {
        const index = this.getNodeIndex(id);
        if (index < 0) return;

        this._saveMode();
        this.options.simpleMode = simpleMode;

        const NodeList = this.getNodeList();
        const results = this.setData(node, id, false);
        if (results.length) {
            NodeList.splice(pIndex, 0, ...results);
            if (this.isSimpleMode())
                this._updateDepth(results[0].pid);
        }

        this._restoreMode();
    }

    insertAfter(node, id, simpleMode) {
        return this.prependChild(node, id, simpleMode);
    }

    removeNode(id) {
        const index = this.getNodeIndex(id);
        const NodeList = this.getNodeList();
        const NodeMap = this.getNodeMap();
        if (index >= 0) {
            NodeList.splice(index, 1);
            delete NodeMap[id];
        }
    }

    toData(childField = 'children') {
        const copyChilds = pid => this.getChildren(pid).map(node => Object.assign({}, node));

        const nodes = copyChilds(this.getRootId());

        const walkNodes = node => {
            delete node.pid;
            if (!this.isLeaf(node.id)) {
                const childNodes = copyChilds(node.id);
                node[childField] = childNodes;
                childNodes.forEach(walkNodes);
            }
        }

        nodes.forEach(walkNodes);

        return nodes;
    }

    toSimpleData() {
        return this.getNodeList().map(node => Object.assign({}, node));
    }

    toPaths(field = 'id', sep = '/') {
        return this.getAllChildren(this.getRootId())
            .filter(node => this.isLeaf(node.id))
            .map(node => this.getPath(node.id, field, sep));
    }

    toAllPaths(field = 'id', sep = '/') {
        return this.getNodeList()
            .map(node => this.getPath(node.id, field, sep));
    }

    clone() {
        return cloneStore(this);
    }
}