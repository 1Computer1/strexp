module.exports = (node, scope) => {
    const object = scope.getValue(node.tree[0]);
    const key = scope.getValue(node.tree[1]);

    if (object === null) {
        if (!(key instanceof StrexpString) && !(key instanceof StrexpSymbol)) {
            throw error(node, 'TYPE_NOT_USABLE', key, 'usable as an index or dictionary key');
        }

        throw error(node, 'KEY_OF_NULL', key);
    }

    if (object instanceof StrexpDictionary) {
        if (!(key instanceof StrexpString) && !(key instanceof StrexpSymbol)) {
            throw error(node, 'TYPE_NOT_USABLE', key, 'usable as a dictionary key');
        }

        return object.value.has(key.value) ? key : null;
    }

    if (object instanceof StrexpArray) {
        if (!(key instanceof StrexpString)) {
            throw error(node, 'TYPE_NOT_USABLE', key, 'usable as an index');
        }

        if (!Util.isInteger(key.value)) {
            throw error(node, 'VALUE_NOT_USABLE', key.value, 'a valid index');
        }

        return object.value[key.value] !== undefined ? key : null;
    }

    if (object instanceof StrexpMatch) {
        if (!(key instanceof StrexpString)) {
            throw error(node, 'TYPE_NOT_USABLE', key, 'usable as an index');
        }

        if (!Util.isInteger(key.value)) {
            throw error(node, 'VALUE_NOT_USABLE', key.value, 'a valid index');
        }

        return object.value[key.value] !== undefined ? key : null;
    }

    if (object instanceof StrexpString) {
        if (!(key instanceof StrexpString)) {
            throw error(node, 'TYPE_NOT_USABLE', key, 'usable as an index');
        }

        if (!Util.isInteger(key.value)) {
            throw error(node, 'VALUE_NOT_USABLE', key.value, 'a valid index');
        }

        return object.value[key.value] !== undefined ? key : null;
    }

    throw error(node, 'TYPE_NOT_USABLE', object, 'have keys or indices', 'does');
};

const Util = require('../../Util');
const error = require('../../Errors');

const StrexpArray = require('../../types/StrexpArray');
const StrexpDictionary = require('../../types/StrexpDictionary');
const StrexpMatch = require('../../types/StrexpMatch');
const StrexpString = require('../../types/StrexpString');
const StrexpSymbol = require('../../types/StrexpSymbol');
