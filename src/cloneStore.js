export default function cloneStore(store) {
    const newStore = new store.constructor(store.toSimpleData(), {
        simpleData: true
    });

    newStore.options = store.options;

    return newStore;
}
