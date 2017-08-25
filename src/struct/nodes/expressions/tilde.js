module.exports = (node, scope) => {
    const object = scope.getValue(node.tree[0]);
    const key = node.tree[1];

    if (object === null) {
        throw error(node, 'KEY_OF_NULL', key);
    }

    if (object instanceof StrexpDictionary) {
        return object.property_get.call(node, [new StrexpString(key)]);
    }

    if (object.property_at) {
        return object.property_at.call(node, [new StrexpString(key)]);
    }

    throw error(node, 'TYPE_NOT_USABLE', object, 'have keys or indices', 'does');
};

const error = require('../../Errors');

const StrexpDictionary = require('../../types/StrexpDictionary');
const StrexpString = require('../../types/StrexpString');
