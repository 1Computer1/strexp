module.exports = (node, scope) => {
    const [ident, valuePart = null, mod] = node.tree;
    if (scope.variables.has(ident)) {
        throw error(node, 'REDECLARATION', ident);
    }

    const value = scope.getValue(valuePart);
    scope.variables.set(ident, value);
    if (mod === 'const') scope.constants.add(ident);
    return value;
};

const error = require('../../Errors');
