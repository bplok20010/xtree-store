
export default function cloneStore(store) {
    const newStore = new store.constructor([], store.options);
    newStore.__NodeList = store.__NodeList.map(v => v);
    newStore.__NodeMap = Object.assign({}, store.__NodeMap);

    return newStore;
}