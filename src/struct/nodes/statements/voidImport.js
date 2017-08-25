module.exports = (node, scope) => {
    const filepath = scope.getValue(node.tree[0]);

    if (!(filepath instanceof StrexpString)) {
        throw error(node, 'TYPE_NOT_USABLE', filepath, 'usable as filepath');
    }

    scope.program.deleteImport(node, filepath.value);
    return null;
};

const error = require('../../Errors');

const StrexpString = require('../../types/StrexpString');
