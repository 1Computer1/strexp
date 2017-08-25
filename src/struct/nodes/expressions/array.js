module.exports = (node, scope) => {
    const items = [];
    for (const item of node.tree[0]) {
        if (item.name === 'itemSplat') {
            const iterable = scope.getValue(item.tree[0]);
            if (!iterable || !iterable.iterator) {
                throw error(node, 'TYPE_NOT_USABLE', iterable, 'iterable');
            }

            const values = Array.from(iterable.iterator(), e => e[1]);
            items.push(...values);
            continue;
        }

        items.push(scope.getValue(item.tree[0]));
    }

    return new StrexpArray(items);
};

const error = require('../../Errors');

const StrexpArray = require('../../types/StrexpArray');
