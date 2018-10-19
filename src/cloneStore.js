
export default function cloneStore(store) {
    const newStore = new store.constructor(null, store.options);
    newStore.__NodeList = store.__NodeList.map(v => v);
    newStore.__NodeMap = Object.assign({}, store.__NodeMap);

    const caches = store._caches;
    const newCache = newStore._cache;

    Object.keys(caches).forEach(key => {
        newCache.set(key, caches[key]);
    })

    return newStore;
}