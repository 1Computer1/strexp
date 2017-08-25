module.exports = (node, scope) => {
    const [declarePart, exportIdent] = node.tree;
    const [ident, valuePart, mod] = declarePart.tree;

    if (scope.variables.has(ident)) {
        throw error(node, 'REDECLARATION', ident);
    }

    const value = scope.getValue(valuePart);
    scope.program.exportValue(exportIdent === undefined ? ident : exportIdent, value);

    scope.variables.set(ident, value);
    if (mod === 'const') scope.constants.add(ident);

    return value;
};

const error = require('../../Errors');
