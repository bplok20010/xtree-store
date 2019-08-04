const { createStore, cloneStore } = require("../lib");
const data = require("./data");
const simpleData = require("./data.json");

const store1 = createStore(data, {
    processNode: node => {
        if (typeof node.value === "object") {
            node.id = node.value.id;
        } else {
            node.id = node.value;
        }

        return node;
    }
});

const store2 = cloneStore(
    createStore(simpleData, {
        simpleData: true
    })
);

//console.log(JSON.stringify(store2.toPaths('label')));

store1.appendChild({ value: 9999 }, 3);
console.log(store1.getChildren(3));

store2.prependChild({ id: 9999 }, 3);
store2.insertBefore({ id: 9998 }, 9999);
store2.insertAfter({ id: 10000 }, 9999);

store2.replaceNode(
    [{ id: 8001 }, { id: 36, label: "福州市" }, { id: 8000 }],
    36
);

console.log(store2.getChildren(3));

console.log(store2.getPath(39));

console.log(store1.getChildren(3).map(node => node.id));
console.log(store2.getChildren(3).map(node => node.id));

console.log(store1.getParentNode(44));
console.log(store1.getParentNodes(44));

console.log(store2.getMaxDepth());

console.log(store2.getDepthNodes(1));
