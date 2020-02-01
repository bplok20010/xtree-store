interface NodeOptions {
	id: string | number | null | undefined;
	pid: string | number | null | undefined;
	root?: boolean;
	leaf: boolean;
	depth: number;
	data: {};
	dirty?: boolean;
}

let id = 1;

export class Node {
	id: string | number | null | undefined;
	pid: string | number | null | undefined;
	root: boolean;
	leaf: boolean;
	dirty: boolean;
	depth: number;
	data: {};
	constructor(node: NodeOptions) {
		this.id = node.id == null && !node.root ? `node_${id++}` : node.id;
		this.pid = node.pid;
		this.root = node.root || false;
		this.leaf = node.leaf;
		this.depth = node.depth;
		this.data = node.data;
		this.dirty = node.dirty == null ? false : node.dirty;
	}
}
