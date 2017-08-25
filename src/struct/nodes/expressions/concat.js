module.exports = (node, scope) => {
    const lh = scope.getValue(node.tree[0]);
    if (!lh.property_concat) {
        throw error(node, 'TYPE_NOT_USABLE', lh, 'concatenatable');
    }

    const rh = scope.getValue(node.tree[1]);
    if (lh.constructor !== rh.constructor) {
        throw error(node, 'TYPES_NOT_USABLE', lh, rh, 'concatenatable');
    }

    return lh.property_concat.call(node, [rh]);
};

const error = require('../../Errors');
