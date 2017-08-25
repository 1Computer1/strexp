module.exports = (node, scope) => {
    const object = scope.getValue(node.tree[0]);
    const key = node.tree[1];

    if (object === null) {
        return null;
    }

    try {
        if (object instanceof StrexpDictionary) {
            return object.property_get.call(node, [new StrexpString(key)]);
        }

        if (object.property_at) {
            return object.property_at.call(node, [new StrexpString(key)]);
        }
    } catch (err) {
        return null;
    }

    return null;
};

const StrexpDictionary = require('../../types/StrexpDictionary');
const StrexpString = require('../../types/StrexpString');
