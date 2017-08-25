module.exports = (node, scope) => {
    const [statements] = node.tree;
    return new LambdaScope(scope.program, scope).getReturnValue(statements);
};

const { LambdaScope } = require('../../Scope');
