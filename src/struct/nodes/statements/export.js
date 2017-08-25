module.exports = (node, scope) => {
    const [valuePart, ident] = node.tree;
    const value = scope.getValue(valuePart);
    scope.program.exportValue(ident, value);
    return value;
};
