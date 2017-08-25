module.exports = (node, scope) => {
    const [value] = node.tree;
    scope.returnToLambda(scope.getValue(value));
    return Scope.symbolReturn;
};

const Scope = require('../../Scope');
