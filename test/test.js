const TreeStore = require('../index');
const data = require('./data');
const simpleData = require('./data.json');

const store1 = TreeStore.create(data, {
    processNode: node => {
        if (typeof node.value === 'object') {
            node.id = node.value.id;
        } else {
            node.id = node.value;
        }

        return node;
    }
});

const store2 = TreeStore.clone(TreeStore.create(simpleData, {
    simpleMode: true,
}));


console.log(store1.getChildren(3).map(node => node.id))
console.log(store2.getChildren(3).map(node => node.id))

console.log(store1.getParentNode(44));
console.log(store1.getParentNodes(44));

console.log(store2.getMaxDepth())

console.log(store2.getDepthNodes(1))
