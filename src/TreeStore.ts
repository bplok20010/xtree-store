import Cache from "./Cache";
import { isEqual, isUndefined } from "./utils";
import { Node } from "./Node";

type IdType = string | number | null | undefined;

export interface TreeOptions {
	rootId?: IdType;
	simpleData?: boolean;
	idField?: string | number;
	pidField?: string | number;
	childrenField?: string | number;
	leafField?: string | number;
	processNode?: ((data: {}) => {}) | null;
	resolveChildren?: ((nodeList: Node[]) => Node[]) | null;
	cache?: boolean;
}

export function createStore(data: {}[] | {}, options: TreeOptions = {}) {
	return new TreeStore(data, options);
}

export class TreeStore {
	options: TreeOptions;
	protected __NodeList: Node[];
	protected __NodeMap: { [prop: string]: Node; [prop: number]: Node };
	protected __root: Node;
	protected __init: boolean = true;
	protected _cache: Cache<Node> = new Cache<Node>();
	protected __saveMode: boolean | undefined;

	constructor(data: {}[] | {}, options: TreeOptions = {}) {
		this.options = {
			rootId: null,
			simpleData: false,
			idField: "id",
			pidField: "pid",
			childrenField: "children",
			leafField: "leaf",
			processNode: null,
			resolveChildren: null,
			cache: true,
			...options,
		};

		const rootData = {
			pid: this.options.rootId,
			id: this.options.rootId,
		};

		this.__root = new Node({
			pid: this.options.rootId,
			id: this.options.rootId,
			leaf: false,
			root: true,
			depth: 0,
			data: rootData,
		});

		this.__NodeList = [];
		this.__NodeMap = {};

		if (data) {
			this.setData(data);
		}

		this.__init = false;
	}

	protected _getChildrenCacheKey(id: IdType) {
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

	hasNode(id: IdType) {
		return this.__NodeMap.hasOwnProperty(id + "");
	}

	isRoot(id: IdType) {
		return isEqual(id, this.getRootId());
	}

	setData(data: Array<{}> | {}, pid = this.options.rootId, insert = true) {
		const items = Array.isArray(data) ? data : [data];

		if (!items.length) return [];

		if (this.isSimpleData()) {
			return this._parseSimpleData(items, pid, insert);
		} else {
			return this._parseData(items, pid, insert);
		}
	}

	protected _parseData(items: Array<{}>, pid: IdType, insert = true) {
		const { idField, childrenField, leafField, processNode, cache: useCache } = this.options;
		const NodeList = this.__NodeList;
		const NodeMap = this.__NodeMap;
		const isInit = this.__init;
		const pNode = this.isRoot(pid) ? this.getRootNode() : this.getNode(pid);
		const results: Node[] = [];
		const pIds = [pid];
		if (!pNode) return results;

		const dfs = (data: {}, pid: IdType, depth = 1) => {
			if (processNode) {
				data = processNode(data);
			}

			const id = data[idField as string];
			const children = data[childrenField as string];

			let leaf = data[leafField as string];
			if (isUndefined(leaf)) {
				leaf = isUndefined(children);
			}

			const node = new Node({
				id,
				pid,
				depth,
				data,
				leaf: !!leaf,
			});

			if (!this.hasNode(id)) {
				results.push(node);
				insert && NodeList.push(node);
				NodeMap[id] = node;
			}

			if (!leaf && Array.isArray(children)) {
				children.forEach(data => dfs(data, id, depth + 1));
			}

			if (!leaf) {
				pIds.push(id);
			}
		};

		items.forEach(data => dfs(data, pNode.id, pNode.depth + 1));

		if (!isInit && useCache) {
			// clear cache
			pIds.forEach(pid => this._cache.delete(this._getChildrenCacheKey(pid)));
		}

		return results;
	}

	protected _parseSimpleData(items: Array<{}>, pid: IdType, insert = true) {
		const { idField, pidField, processNode, cache: useCache } = this.options;
		const NodeList = this.__NodeList;
		const NodeMap = this.__NodeMap;
		const pNode = this.isRoot(pid) ? this.getRootNode() : this.getNode(pid);
		const isInit = this.__init;
		const results: Node[] = [];

		if (!pNode) return results;

		items.forEach(data => {
			if (processNode) {
				data = processNode(data);
			}

			const id = data[idField as string];
			const pid =
				data[pidField as string] === undefined ? pNode.id : data[pidField as string];

			const node = new Node({
				id,
				pid,
				depth: 0,
				leaf: false,
				data,
				dirty: true,
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

	protected _updateDepth(id: IdType = this.getRootId()) {
		const node = this.isRoot(id) ? this.getRootNode() : this.getNode(id);
		const pDepth = node ? node.depth : 0;
		const childNodes = this.getChildren(id);

		if (node && node.dirty) {
			node.leaf = !childNodes.length;
			node.dirty = false;
		}

		childNodes.forEach((node: Node) => {
			node.depth = pDepth + 1;
			this._updateDepth(node.id);
		});
	}

	protected _clearCacheByPID(pid: IdType) {
		const nodes = this.getAllChildren(pid);
		this._cache.delete(this._getChildrenCacheKey(pid));

		nodes.forEach(node => {
			this._cache.delete(this._getChildrenCacheKey(node.id));
		});
	}

	getRootNode() {
		return this.__root;
	}

	getNode(id: IdType): Node | null {
		const NodeMap = this.__NodeMap;

		if (this.isRoot(id)) return null;

		return NodeMap[String(id)] || null;
	}

	getNodeIndex(id: IdType) {
		if (this.isRoot(id)) return 0;

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

	indexOf(id: IdType) {
		return this.getNodeIndex(id);
	}

	getDepth(id: IdType) {
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

	isLeaf(id: IdType) {
		if (this.isRoot(id)) return false;

		const node = this.getNode(id);
		return node ? node.leaf : true;
	}

	getFirstChild(pid?: IdType) {
		const nodes = this.getChildren(pid);
		return nodes[0];
	}

	getLastChild(pid?: IdType) {
		const nodes = this.getChildren(pid);
		return nodes[nodes.length - 1];
	}

	isFirstChild(id: IdType) {
		if (this.isRoot(id)) return true;
		const node = this.getNode(id);
		if (!node) return false;

		return node === this.getFirstChild(node.pid);
	}

	isLastChild(id: IdType) {
		if (this.isRoot(id)) return true;
		const node = this.getNode(id);
		if (!node) return false;

		return node === this.getLastChild(node.pid);
	}

	getDepthNodes(depth = 1) {
		if (depth < 1) {
			return [];
		}
		return this.__NodeList.filter(node => node.depth === depth);
	}

	getDepthIds(depth?: number) {
		return this.getDepthNodes(depth).map(node => node.id);
	}

	getChildren(id: IdType = this.getRootId()) {
		const key = this._getChildrenCacheKey(id);
		const { cache: useCache, resolveChildren } = this.options;

		if (useCache && this._cache.has(key)) {
			return this._cache.get(key);
		}

		let results = this.isLeaf(id) ? [] : this.__NodeList.filter(node => isEqual(node.pid, id));

		if (resolveChildren) {
			results = resolveChildren(results);
		}

		if (useCache) {
			this._cache.set(key, results);
		}

		return results;
	}

	getChildrenIds(id?: IdType): IdType[] {
		return this.getChildren(id).map((node: Node) => node.id);
	}

	getAllChildren(id?: IdType) {
		const nodes = this.getChildren(id);
		const results: Node[] = [];

		nodes.forEach((node: Node) => {
			results.push(node);
			results.push(...this.getAllChildren(node.id));
		});

		return results;
	}

	getAllChildrenIds(id?: IdType) {
		return this.getAllChildren(id).map(node => node.id);
	}

	getParentNode(id: IdType = this.getRootId()) {
		const node = this.getNode(id);

		if (!node) return null;

		return this.getNode(node.pid);
	}

	getParentNodes(id?: IdType) {
		const pNodes: Node[] = [];
		let pNode: Node | null;

		while ((pNode = this.getParentNode(id))) {
			pNodes.unshift(pNode);
			id = pNode.id;
		}

		return pNodes;
	}

	getParentIds(id?: IdType) {
		return this.getParentNodes(id).map(node => node.id);
	}

	getPath(id: IdType, field: string = "id", sep: string = "/") {
		const node = this.getNode(id);

		if (this.isRoot(id) || !node) return "";
		const nodes = this.getParentNodes(id).concat(node);

		return nodes
			.map(node => {
				if (field === "id") return node.id;
				return node.data[field];
			})
			.join(sep);
	}

	protected _saveMode() {
		this.__saveMode = this.options.simpleData;
	}

	protected _restoreMode() {
		if (this.__saveMode !== undefined) {
			this.options.simpleData = this.__saveMode;
			this.__saveMode = undefined;
		}
	}

	appendChild(
		data: {}[] | {},
		pid: IdType = this.getRootId(),
		simpleData = this.options.simpleData
	) {
		const pNode = this.isRoot(pid) ? this.getRootNode() : this.getNode(pid);
		if (!pNode) return;

		pNode.leaf = false;

		this._saveMode();

		this.options.simpleData = simpleData;
		this.setData(data, pid);

		this._restoreMode();
	}

	prependChild(
		data: {}[] | {},
		pid: IdType = this.getRootId(),
		simpleData = this.options.simpleData
	) {
		const pNode = this.isRoot(pid) ? this.getRootNode() : this.getNode(pid);
		if (!pNode) return;

		pNode.leaf = false;

		const pIndex = this.getNodeIndex(pid);
		if (pIndex < 0) return;

		this._saveMode();
		this.options.simpleData = simpleData;

		const NodeList = this.getNodeList();
		const results = this.setData(data, pid, false);

		if (results.length) {
			NodeList.splice(pIndex, 1, ...results.concat(NodeList[pIndex]));
			if (this.isSimpleData()) this._updateDepth(pid);
		}

		this._restoreMode();
	}

	insertBefore(data: {}[] | {}, id: IdType, simpleData = this.options.simpleData) {
		if (this.isRoot(id)) return;

		const index = this.getNodeIndex(id);
		if (index < 0) return;

		const pNode = this.getParentNode(id);
		if (!pNode) return;

		this._saveMode();
		this.options.simpleData = simpleData;

		const NodeList = this.getNodeList();
		const results = this.setData(data, pNode.id, false);
		if (results.length) {
			NodeList.splice(index, 0, ...results);
			if (this.isSimpleData()) this._updateDepth(pNode.id);
		}

		this._restoreMode();
	}

	insertAfter(data: {}[] | {}, id: IdType, simpleData = this.options.simpleData) {
		if (this.isRoot(id)) return;

		const index = this.getNodeIndex(id);
		if (index < 0) return;

		const pNode = this.getParentNode(id);
		if (!pNode) return;

		this._saveMode();
		this.options.simpleData = simpleData;

		const NodeList = this.getNodeList();
		const results = this.setData(data, pNode.id, false);
		if (results.length) {
			NodeList.splice(index, 1, ...[NodeList[index]].concat(results));
			if (this.isSimpleData()) this._updateDepth(pNode.id);
		}

		this._restoreMode();
	}

	removeNode(id: IdType) {
		const index = this.getNodeIndex(id);
		const nodes = this.getAllChildren(id);
		const NodeList = this.getNodeList();
		const NodeMap = this.getNodeMap();
		const removeNode = NodeList[index];

		if (index >= 0) {
			NodeList.splice(index, 1);
			delete NodeMap[String(id)];

			this._cache.delete(this._getChildrenCacheKey(removeNode.id));

			nodes.forEach(node => {
				const idx = this.getNodeIndex(node.id);
				if (idx >= 0) {
					NodeList.splice(index, 1);
					delete NodeMap[String(id)];
				}

				this._cache.delete(this._getChildrenCacheKey(node.id));
			});
		}
	}

	replaceNode(data: {}[] | {}, id: IdType, simpleData = this.options.simpleData) {
		if (this.isRoot(id)) return;

		const oldNode = this.getNode(id);
		if (!oldNode) return;

		const pNode = this.getParentNode(id);
		if (!pNode) return;

		const siblings = this.getChildren(pNode.id);
		const index = siblings.indexOf(oldNode);
		const prevNode = index === -1 ? null : siblings[index - 1];

		this.removeNode(oldNode.id);

		if (prevNode) {
			this.insertAfter(data, prevNode.id, simpleData);
		} else {
			this.prependChild(data, pNode.id, simpleData);
		}
	}

	removeAllNode() {
		this.__NodeList = [];
		this.__NodeMap = {};
		this.clearCache();
	}

	toData(childField = "children") {
		const nodes = this.getChildren(this.getRootId());

		const dfs = (node: Node) => {
			const data = {
				...node.data,
			};

			if (!node.leaf) {
				const nodes = this.getChildren(node.id);
				data[childField] = nodes.map(dfs);
			}

			return data;
		};

		return nodes.map(dfs);
	}

	toSimpleData() {
		return this.getNodeList().map((node: Node) => ({ ...node.data }));
	}

	toPaths(field = "id", sep = "/") {
		return this.getAllChildren(this.getRootId())
			.filter(node => node.leaf)
			.map(node => this.getPath(node.id, field, sep));
	}

	toAllPaths(field = "id", sep = "/") {
		return this.getNodeList().map(node => this.getPath(node.id, field, sep));
	}

	clone() {
		const options = this.options;
		const data = this.toSimpleData();

		const tree = new TreeStore(data, {
			simpleData: true,
		});

		tree.options = options;

		return tree;
	}
}
