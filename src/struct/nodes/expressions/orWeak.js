module.exports = (node, scope) => {
    const lh = scope.getValue(node.tree[0]);

    if (lh instanceof StrexpArray || lh instanceof StrexpString) {
        if (!lh.value.length) return scope.getValue(node.tree[1]);
        return lh;
    }

    if (lh instanceof StrexpDictionary) {
        if (!lh.value.size) return scope.getValue(node.tree[1]);
        return lh;
    }

    return lh !== null ? lh : scope.getValue(node.tree[1]);
};

const StrexpArray = require('../../types/StrexpArray');
const StrexpDictionary = require('../../types/StrexpDictionary');
const StrexpString = require('../../types/StrexpString');
