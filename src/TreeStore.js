import normalize from './normalize';
import {
    isEqual,
    isUndefined,
    undef,
} from './utils';

export default class TreeStore {

    static clone(store) {
        const newStore = new TreeStore([], store.options);
        newStore.__NodeList = store.__NodeList.map(v => v);
        newStore.__NodeMap = Object.assign({}, store.__NodeMap);

        return newStore;
    }

    static create(data, options) {
        return new TreeStore(data, options);
    }

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

    getRootId() {
        return this.options.rootId;
    }

    isRoot(id) {
        return isEqual(id, this.getRootId());
    }

    setData(data, pid) {
        pid = undef(pid, this.options.rootId);

        data = Array.isArray(data) ? data : [data];

        if (!data.length) return;

        if (this.isSimpleMode()) {
            this._parseSimpleData(data, pid);
        } else {
            this._parseData(data, pid);
        }
    }

    _parseData(data, pid) {
        const { idField, childrenField, processNode } = this.options;
        const NodeList = this.__NodeList;
        const NodeMap = this.__NodeMap;

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

            NodeList.push(node);
            NodeMap[id] = node;

            if (Array.isArray(children)) {
                children.forEach(node => walkNodes(node, id, depth + 1));
            }
        }

        data.forEach(node => walkNodes(node, pid, 1));
    }

    _parseSimpleData(data, pid) {
        const { idField, pidField, processNode } = this.options;
        const NodeList = this.__NodeList;
        const NodeMap = this.__NodeMap;

        data.forEach(node => {
            if (processNode) {
                node = processNode(node);
            }

            const id = node[idField];
            const pid = node[pidField];

            node = normalize(node, {
                id,
                pid,
            });

            NodeList.push(node);
            NodeMap[id] = node;
        });

        //update depth
        this._updateDepth(pid);
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

    getDepthNodes(depth = 1) {
        if (depth < 1) {
            return this.getRootNode();
        }
        return this.__NodeList.filter(node => node.depth === depth);
    }

    getChildren(id) {
        id = undef(id, this.getRootId());
        return this.isLeaf(id) ?
            [] :
            this.__NodeList.filter(node => isEqual(node.pid, id));
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
            pNodes.push(pNode);
            id = pNode.id;
        }

        return pNodes;
    }

    getParentIds(id) {
        return this.getParentNodes(id).map(node => node.id);
    }
}