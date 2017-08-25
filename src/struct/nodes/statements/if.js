module.exports = (node, scope) => {
    const [condition, trueBranch, falseBranch] = node.tree;
    const result = scope.getValue(condition);

    if (result !== null) {
        return new Scope(scope.program, scope).evaluate(trueBranch);
    }

    return new Scope(scope.program, scope).evaluate(falseBranch);
};

const Scope = require('../../Scope');
