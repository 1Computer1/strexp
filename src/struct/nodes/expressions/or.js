module.exports = (node, scope) => {
    const lh = scope.getValue(node.tree[0]);
    return lh !== null ? lh : scope.getValue(node.tree[1]);
};
