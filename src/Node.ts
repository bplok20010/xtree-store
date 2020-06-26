interface NodeOptions {
	id: any;
	pid: any;
	root?: boolean;
	leaf: boolean;
	depth: number;
	data: Record<any, any>;
	dirty?: boolean;
}

export class Node {
	id: any;
	pid: any;
	root: boolean;
	leaf: boolean;
	dirty: boolean;
	depth: number;
	data: Record<any, any>;
	constructor(node: NodeOptions) {
		this.id = node.id;
		this.pid = node.pid;
		this.root = node.root || false;
		this.leaf = node.leaf;
		this.depth = node.depth;
		this.data = node.data;
		this.dirty = node.dirty == null ? false : node.dirty;
	}
}
