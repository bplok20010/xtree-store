# xtree-store

构建树形模型

## install & import

`npm install --save xtree-store`

`import { createStore, path2data, TreeStore } from 'xtree-store'`

## Node

```typescript
type IdType = any;

interface Node {
	id: any;
	pid: IdType;
	leaf: boolean;
	depth: number;
	data: {};
}
```

## TreeStore Options

```typescript
interface TreeOptions {
	rootId?: IdType;
	simpleData?: boolean;
	idField?: string | number;
	pidField?: string | number;
	childrenField?: string | number;
	leafField?: string | number;
	dataProcessor?: ((data: { [prop: string]: any }) => {}) | null;
	childrenFilter?: (nodeList: Node[], id: IdType) => Node[];
	cache?: boolean;
}
```

```json
{
	"rootId": null,
	"simpleData": false,
	"idField": "id",
	"pidField": "pid", //simpleData=true时有效
	"childrenField": "children", //simpleData=false时有效
	"leafField": "leaf", //simpleData=false时有效
	"dataProcessor": data => data,
	"childrenFilter": (nodes, pid) => nodes, //getChildren时结果处理函数
	"cache": true // getChildren启用缓存
}
```

支持 2 种数据结构类型：

`simpleData: false`

```json
{
	"id": 1,
	"children": [{ "id": 2 }, { "id": 3 }]
}
```

`simpleData: true`

```json
[
	{ "id": 1, "pid": null },
	{ "id": 2, "pid": 1 },
	{ "id": 3, "pid": 1 }
]
```

## TreeStore API

### 常用 API

`constructor(data[, options])` 构造函数

`isRoot(id)` 是否顶层节点

`isLeaf(id)` 是否叶子节点

`isSimpleData()` 是否为简单数据模式

`getNodeList()` 获取所有节点

`getNodeMap()` 获取节点 Map<key,node>对象

`getRootId()` 获取根节点 ID

`hasNode(id)` 当前节点是否存在

`getRootNode()` 获取跟节点

`getNode(id)` 获取指定节点

`getNodeIndex(id)` 获取节点所在的索引

`indexOf(id)` 作用同 `getNodeIndex`

`getDepth(id)` 获取节点的深度值

`getDepthNodes(depth)` 获取指定深度的节点列表

`getDepthIds(depth)` 获取指定深度的节点 ID 列表

`getMaxDepth()` 获取当前数据模型的最大深度值

`getFirstChild(id)` 获取指定节点下的第一个子节点

`getLastChild(id)` 获取指定节点下的最后一个个子节点

`isFirstChild(id)` 当前节点是否为第一个子节点

`isLastChild(id)` 当前节点是否为最后一个子节点

`getChildren(id)` 获取节点下的子节点

`getChildrenIds(id)` 作用参考`getChildren`

`getAllChildren(id)` 获取节点下的所有子节点

`getAllChildrenIds(id)` 作用参考`getAllChildren`

`getParentNode(id)` 获取父节点

`getParentNodes(id)` 获取所有父节点

`getParentIds(id)` 获取所有父节点 ID

`getPath(id, field = 'id', sep = '/')` 获取节点路径

### 模型管理 API

`appendChild(data, pid, simpleData)` 给指定 pid 节点添加子节点

`prependChild(data, pid, simpleData)`

`insertBefore(data, id, simpleData)`

`insertAfter(data, id, simpleData)`

`removeNode(id)`

`removeAllNode()`

`replaceNode(node/*新*/, id/*旧*/, simpleData)` 替换节点

### 模型数据转换 API

`toData(processor)` 返回`simpleData=false`的数据结构

`toSimpleData(processor)` 返回`simpleData=true`的数据结构

`toPaths()` 返回所有叶子节点的 path

`toAllPaths()` 返回所有节点的 path

### 其他

`clone()` 返回一个新的数据模型实例

`clearCache()` 清空缓存

## createStore(data, options)

作用同`new TreeStore(...)`

## path2data(paths: string[] | string, options:PathOptions): PathData[]

options 默认：

```json
{
	"sep": "/",
	"rootId": null
}
```

将`path`信息转换成节点列表

```typescript
interface PathOptions {
	sep?: string;
	rootId?: IdType;
	processor?: (data: PathData) => PathData;
}
interface PathData {
	id: string;
	pid: IdType;
	text: string;
	[x: string]: any;
}
```

```javascript
path2data(["A/B/C", "A/B/D"]);
```

```json
//output
[
	{ id: "A", pid: null, text: "A" },
	{ id: "A/B", pid: "A", text: "B" },
	{ id: "A/B/C", pid: "A/B", text: "C" },
	{ id: "A/B/D", pid: "A/B", text: "D" },
];
```

## Usage

```javascript
import { createStore, cloneStore, path2data, TreeStore } from "xtree-store";

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

// 示例1
const store1 = new TreeStore(data);

// 示例2
const store2 = new TreeStore(store1.toSimpleData(), {
	simpleData: true,
});
```
