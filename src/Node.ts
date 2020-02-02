interface NodeOptions {
	id: string | number | null | undefined;
	pid: string | number | null | undefined;
	root?: boolean;
	leaf: boolean;
	depth: number;
	data: { [x: string]: any };
	dirty?: boolean;
}

export class Node {
	id: string | number | null | undefined;
	pid: string | number | null | undefined;
	root: boolean;
	leaf: boolean;
	dirty: boolean;
	depth: number;
	data: { [x: string]: any };
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
