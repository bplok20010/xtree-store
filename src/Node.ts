export type DataType = Record<any, any>;

interface NodeOptions<T = DataType> {
	id: any;
	pid: any;
	root?: boolean;
	leaf: boolean;
	depth: number;
	data: T;
	dirty?: boolean;
}

export class Node<T = DataType> {
	id: any;
	pid: any;
	root: boolean;
	leaf: boolean;
	dirty: boolean;
	depth: number;
	data: T;
	constructor(node: NodeOptions<T>) {
		this.id = node.id;
		this.pid = node.pid;
		this.root = node.root || false;
		this.leaf = node.leaf;
		this.depth = node.depth;
		this.data = node.data;
		this.dirty = node.dirty == null ? false : node.dirty;
	}
}
