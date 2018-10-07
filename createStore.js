var TreeStore = require('./lib/TreeStore').default;

module.exports = function createStore(data, options) {
    return new TreeStore(data, options)
}