module.exports = (node, scope) => {
    const lh = scope.getValue(node.tree[0]);

    if (!(lh instanceof StrexpString)) {
        throw error(node, 'TYPE_NOT_USABLE', lh, 'matchable');
    }

    const rh = scope.getValue(node.tree[1]);
    const matched = lh.property_match.call(node, [rh]);
    if (matched === null) return null;

    const index = new StrexpString(node.tree[2]);
    return matched.property_at.call(node, [index]);
};

const error = require('../../Errors');

const StrexpString = require('../../types/StrexpString');
