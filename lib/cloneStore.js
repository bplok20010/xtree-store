
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = cloneStore;

function cloneStore(store) {
  var newStore = new store.constructor(store.toSimpleData(), {
    simpleData: true
  });
  newStore.options = store.options;
  return newStore;
}