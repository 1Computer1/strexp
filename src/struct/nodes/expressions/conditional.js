module.exports = (node, scope) => {
    const [condition, trueBranch, falseBranch] = node.tree;
    const result = scope.getValue(condition);

    if (result !== null) {
        return scope.getValue(trueBranch);
    } else {
        return scope.getValue(falseBranch);
    }
};
