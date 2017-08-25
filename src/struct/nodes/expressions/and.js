module.exports = (node, scope) => {
    const lh = scope.getValue(node.tree[0]);
    return lh !== null ? scope.getValue(node.tree[1]) : null;
};
