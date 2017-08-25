module.exports = (node, scope) => {
    const dict = new StrexpDictionary(new Map());

    for (const entry of node.tree[0]) {
        const [kv, mod] = entry.tree;
        let key;

        if (kv.name === 'entryComputed') {
            key = scope.getValue(kv.tree[0]);
            if (!(key instanceof StrexpString) && !(key instanceof StrexpSymbol)) {
                throw error(node, 'TYPE_NOT_USABLE', key, 'usable as a dictionary key');
            }

            key = key.value;
        } else {
            key = kv.tree[0];
        }

        const newValue = scope.getValue(kv.tree[1]);
        dict.value.set(key, newValue);

        if (mod === 'private') {
            dict.hidden.add(key);
        }
    }

    return dict;
};

const error = require('../../Errors');

const StrexpDictionary = require('../../types/StrexpDictionary');
const StrexpString = require('../../types/StrexpString');
const StrexpSymbol = require('../../types/StrexpSymbol');
