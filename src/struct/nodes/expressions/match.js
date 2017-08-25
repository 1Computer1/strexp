module.exports = (node, scope) => {
    const lh = scope.getValue(node.tree[0]);

    if (!(lh instanceof StrexpString)) {
        throw error(node, 'TYPE_NOT_USABLE', lh, 'matchable');
    }

    const rh = scope.getValue(node.tree[1]);
    return lh.property_match.call(node, [rh]);
};

const error = require('../../Errors');

const StrexpString = require('../../types/StrexpString');
