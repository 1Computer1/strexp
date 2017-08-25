module.exports = (node, scope) => {
    const [location, valuePart] = node.tree;

    if (typeof location === 'string') {
        if (!scope.hasVariable(location)) {
            throw error(node, 'NOT_DEFINED', location);
        }

        const newValue = scope.getValue(valuePart);
        scope.setVariable(node, location, newValue);
        return newValue;
    }

    const object = scope.getValue(location.tree[0]);

    if (object instanceof StrexpDictionary) {
        const newValue = scope.getValue(valuePart);
        object.property_set.call(node, [new StrexpString(location.tree[1]), newValue]);
        return newValue;
    }

    if (object instanceof StrexpArray) {
        const newValue = scope.getValue(valuePart);
        object.property_set.call(node, [new StrexpString(location.tree[1]), newValue]);
        return newValue;
    }

    throw error(node, 'TYPE_NOT_USABLE', object, 'have keys or indices', 'does');
};

const error = require('../../Errors');

const StrexpArray = require('../../types/StrexpArray');
const StrexpDictionary = require('../../types/StrexpDictionary');
const StrexpString = require('../../types/StrexpString');
