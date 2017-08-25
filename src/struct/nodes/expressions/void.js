module.exports = (node, scope) => {
    scope.getValue(node.tree[0]);
    return null;
};
