
let id = 1;

export default function normalize(data, defaults) {
    const node = Object.assign(
        {
            id: null,
            pid: null,
            leaf: undefined,
            depth: 1,
        },
        data,
        defaults
    );

    if (node.id == null) {
        node.id = 'node_' + id++;
    };

    return node;
}