module.exports = (node, scope) => {
    const ident = node.tree[0];
    const value = ident[0] === '@'
        ? scope.program.getGlobalVariable(node, ident)
        : scope.getVariable(ident);

    if (value === undefined) {
        throw error(node, 'NOT_DEFINED', node.tree[0]);
    }

    return value;
};

const error = require('../../Errors');
