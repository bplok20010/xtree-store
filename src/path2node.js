/**
 *
 * @param {array|string} paths [paths=[]]
 * @param {string} sep [sep='/']
 * @param {string|number} rootId [rootId=null]
 * @return {array}
 *
 * @example
 * path2node(["A/B/C", "A/B/D", "A/E/C"]);
 */
export default function path2node(paths = [], sep = "/", rootId = null) {
    const nodes = [];
    const map = Object.create(null);

    paths = Array.isArray(paths) ? paths : [paths];

    paths.forEach(path => {
        if (path == null) return;
        path += "";

        const pathArray = path.split(sep);

        let pid = rootId;

        for (let i = 0; i < pathArray.length; i++) {
            const label = pathArray[i];
            const id = pathArray.slice(0, i + 1).join(sep);

            if (!map[id]) {
                const node = {
                    id,
                    pid,
                    label
                };

                nodes.push(node);
                map[id] = node;
            }

            pid = id;
        }
    });

    return nodes;
}
