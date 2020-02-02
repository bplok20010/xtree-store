import { createStore, TreeStore } from "../src";

const simpleData = [
	{ t: "1", id: "a" },
	{ t: "2", id: "b", pid: "a" },
	{ t: "3", id: "c", pid: "a" },
	{ t: "4", id: "d", pid: "a" },
	{ t: "5", id: "e", pid: "a" },
	{ t: "6", id: "e1", pid: "b" },
	{ t: "7", id: "e2", pid: "b" },
	{ t: "8", id: "e3", pid: "c" },
	{ t: "9", id: "e4", pid: "d" },
];

const data = {
	t: "1",
	id: "a",
	children: [
		{
			t: "2",
			id: "b",
			children: [
				{ t: "6", id: "e1" },
				{ t: "7", id: "e2" },
			],
		},
		{ t: "3", id: "c", children: [{ t: "8", id: "e3" }] },
		{ t: "4", id: "d", children: [{ t: "9", id: "e4" }] },
		{ t: "5", id: "e" },
	],
};

test("createStore simpleData", () => {
	const tree = createStore(simpleData, {
		simpleData: true,
	});

	expect(tree.toSimpleData()).toEqual([
		{ t: "1", id: "a", pid: null },
		{ t: "2", id: "b", pid: "a" },
		{ t: "3", id: "c", pid: "a" },
		{ t: "4", id: "d", pid: "a" },
		{ t: "5", id: "e", pid: "a" },
		{ t: "6", id: "e1", pid: "b" },
		{ t: "7", id: "e2", pid: "b" },
		{ t: "8", id: "e3", pid: "c" },
		{ t: "9", id: "e4", pid: "d" },
	]);
});

test("createStore data", () => {
	const tree = createStore(data, {
		simpleData: false,
	});

	expect(tree.toData()).toEqual([data]);
});

test("getChildren -1", () => {
	const tree = createStore(simpleData, {
		simpleData: true,
	});

	expect(tree.getChildren("a").length).toEqual(4);
	expect(tree.getChildrenIds("a")).toEqual(["b", "c", "d", "e"]);
});

test("getChildren -2", () => {
	const tree = createStore(simpleData, {
		simpleData: true,
	});

	expect(tree.getChildren().length).toEqual(1);
	expect(tree.getChildrenIds()).toEqual(["a"]);
});

test("getAllChildren -1", () => {
	const tree = createStore(simpleData, {
		simpleData: true,
	});

	expect(tree.getAllChildren("a").length).toEqual(8);
	expect(tree.getAllChildrenIds("a")).toEqual(
		expect.arrayContaining(["b", "c", "d", "e", "e1", "e2", "e3", "e4"])
	);
});

test("getAllChildren -2", () => {
	const tree = createStore(simpleData, {
		simpleData: true,
	});

	expect(tree.getAllChildren().length).toEqual(9);
	expect(tree.getAllChildrenIds()).toEqual(
		expect.arrayContaining(["a", "b", "c", "d", "e", "e1", "e2", "e3", "e4"])
	);
});

test("getParentNode -1", () => {
	const tree = createStore(simpleData, {
		simpleData: true,
	});

	expect(tree.getParentNode()).toEqual(null);
	expect(tree.getParentNode("a")).toEqual(null);
});

test("getParentNode -2", () => {
	const tree = createStore(simpleData, {
		simpleData: true,
	});

	expect(tree.getParentNode("e1").id).toEqual("b");
});

test("getParentNodes -1", () => {
	const tree = createStore(simpleData, {
		simpleData: true,
	});

	expect(tree.getParentNodes()).toEqual([]);
});

test("getParentNodes -2", () => {
	const tree = createStore(simpleData, {
		simpleData: true,
	});

	expect(tree.getParentNodes("e1").length).toEqual(2);
	expect(tree.getParentIds("e1")).toEqual(["a", "b"]);
});

test("getPath", () => {
	const tree = createStore(simpleData, {
		simpleData: true,
	});

	expect(tree.getPath("e1")).toEqual("a/b/e1");
	expect(tree.getPath("e1", "id", "_")).toEqual("a_b_e1");
	expect(tree.getPath("e1", "t", "_")).toEqual("1_2_6");
});

test("getDepthNodes", () => {
	const tree = createStore(simpleData, {
		simpleData: true,
	});

	expect(tree.getDepthNodes(0)).toEqual([]);

	expect(tree.getDepthNodes(1).length).toEqual(1);
	expect(tree.getDepthIds(1)).toEqual(["a"]);
	expect(tree.getDepthNodes(2).length).toEqual(4);
	expect(tree.getDepthIds(2)).toEqual(["b", "c", "d", "e"]);
});

test("isLastChild", () => {
	const tree = createStore(simpleData, {
		simpleData: true,
	});

	expect(tree.isLastChild("b")).toEqual(false);
	expect(tree.isLastChild("e")).toEqual(true);
});

test("isFirstChild", () => {
	const tree = createStore(simpleData, {
		simpleData: true,
	});

	expect(tree.isFirstChild("b")).toEqual(true);
	expect(tree.isFirstChild("e")).toEqual(false);
});

test("isLeaf", () => {
	const tree = createStore(simpleData, {
		simpleData: true,
	});

	expect(tree.isLeaf("a")).toEqual(false);
	expect(tree.isLeaf("e1")).toEqual(true);
});

test("getMaxDepth", () => {
	const tree = createStore(simpleData, {
		simpleData: true,
	});

	expect(tree.getMaxDepth()).toEqual(3);
});

test("getDepth", () => {
	const tree = createStore(simpleData, {
		simpleData: true,
	});

	expect(tree.getDepth("a")).toEqual(1);
	expect(tree.getDepth("b")).toEqual(2);
	expect(tree.getDepth("e1")).toEqual(3);
});

test("toPaths", () => {
	const tree = createStore(data, {
		simpleData: false,
	});

	expect(tree.toPaths()).toEqual(["a/b/e1", "a/b/e2", "a/c/e3", "a/d/e4", "a/e"]);
	expect(tree.toPaths("t")).toEqual(["1/2/6", "1/2/7", "1/3/8", "1/4/9", "1/5"]);
});

test("toAllPaths", () => {
	const tree = createStore(data, {
		simpleData: false,
	});

	expect(tree.toAllPaths()).toEqual([
		"a",
		"a/b",
		"a/b/e1",
		"a/b/e2",
		"a/c",
		"a/c/e3",
		"a/d",
		"a/d/e4",
		"a/e",
	]);
});

test("appendChild & prependChild -1", () => {
	const tree = createStore(data, {
		simpleData: false,
	});

	tree.appendChild([
		{
			id: "x2",
		},
	]);

	tree.prependChild([
		{
			id: "x1",
		},
	]);

	expect(tree.getChildrenIds()).toEqual(["x1", "a", "x2"]);
	expect(tree.getChildren().length).toEqual(3);
});

test("appendChild & prependChild -2", () => {
	const tree = createStore(data, {
		simpleData: false,
	});

	tree.appendChild(
		[
			{
				id: "y2",
			},
		],
		"a"
	);

	tree.prependChild(
		[
			{
				id: "y1",
			},
		],
		"a"
	);

	expect(tree.getChildrenIds("a")).toEqual(["y1", "b", "c", "d", "e", "y2"]);
	expect(tree.getChildren("a").length).toEqual(6);
});

test("insertBefore & insertAfter", () => {
	const tree = createStore(data, {
		simpleData: false,
	});

	tree.insertBefore(
		[
			{
				id: "c1",
			},
		],
		"c"
	);

	tree.insertAfter(
		[
			{
				id: "c2",
			},
		],
		"c"
	);

	expect(tree.getChildrenIds("a")).toEqual(["b", "c1", "c", "c2", "d", "e"]);
	expect(tree.getChildren("a").length).toEqual(6);
});

test("removeNode", () => {
	const tree = createStore(data, {
		simpleData: false,
	});

	tree.removeNode("c");

	expect(tree.getChildrenIds("a")).toEqual(["b", "d", "e"]);
	expect(tree.getChildren("a").length).toEqual(3);
});

test("dataProcessor", () => {
	const tree = createStore([{ key: "a" }, { key: "b", parentId: "a" }], {
		simpleData: false,
		dataProcessor(data) {
			return {
				...data,
				id: data.key,
				pid: data.parentId,
			};
		},
	});

	expect(tree.getAllChildren().length).toEqual(2);
	expect(tree.getAllChildrenIds()).toEqual(["a", "b"]);
});

test("childrenFilter", () => {
	const tree = createStore(data, {
		simpleData: false,
		childrenFilter(nodes, pid) {
			if (pid === "b") {
				return nodes.filter(node => node.data.t === "7");
			}

			return nodes;
		},
	});

	expect(tree.getAllChildren().length).toEqual(8);
	expect(tree.getAllChildrenIds()).toEqual(["a", "b", "e2", "c", "e3", "d", "e4", "e"]);
});

test("idField", () => {
	const tree = createStore(data, {
		simpleData: false,
		idField: "t",
	});

	expect(tree.getAllChildren().length).toEqual(9);
	expect(tree.getAllChildrenIds()).toEqual(["1", "2", "6", "7", "3", "8", "4", "9", "5"]);
});

test("idField", () => {
	const tree = createStore(simpleData, {
		simpleData: true,
		idField: "t1",
		pidField: "t2",
	});

	expect(tree.getChildren().length).toEqual(9);
	expect(tree.getChildrenIds()).toEqual([
		"node_1",
		"node_2",
		"node_3",
		"node_4",
		"node_5",
		"node_6",
		"node_7",
		"node_8",
		"node_9",
	]);
});

test("toData - toSimpleData", () => {
	const data = [
		{
			id: 1,
		},
		{
			id: 2,
			children: [
				{ id: 5 },
				{
					id: 6,
					children: [{ id: 8 }, { id: 9 }, { id: 10 }],
				},
				{ id: 7 },
			],
		},
		{
			id: 3,
		},
		{
			id: 4,
		},
	];

	const store1 = new TreeStore(data);

	expect(store1.toSimpleData()).toEqual([
		{ id: 1, pid: null },
		{ id: 2, pid: null },
		{ id: 5, pid: 2 },
		{ id: 6, pid: 2 },
		{ id: 8, pid: 6 },
		{ id: 9, pid: 6 },
		{ id: 10, pid: 6 },
		{ id: 7, pid: 2 },
		{ id: 3, pid: null },
		{ id: 4, pid: null },
	]);

	const store2 = new TreeStore(store1.toSimpleData(), {
		simpleData: true,
	});

	expect(
		store2.toData(data => {
			delete data.pid;
			return data;
		})
	).toEqual(data);
});
