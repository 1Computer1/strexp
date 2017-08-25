module.exports = (node, scope) => {
    const err = scope.getValue(node.tree[0]);
    if (!(err instanceof StrexpError)) {
        throw error(node, 'TYPE_NOT_USABLE', err, 'an error');
    }

    throw err;
};

const error = require('../../Errors');

const StrexpError = require('../../types/StrexpError');
