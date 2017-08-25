module.exports = (node, scope) => {
    const lh = scope.getValue(node.tree[0]);
    const rh = scope.getValue(node.tree[1]);
    return lh !== rh ? lh : null;
};
