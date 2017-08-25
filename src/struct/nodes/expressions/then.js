module.exports = (node, scope) => {
    const [lh, rh] = node.tree;
    scope.getValue(lh);
    return scope.getValue(rh);
};
