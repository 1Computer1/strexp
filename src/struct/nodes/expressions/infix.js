module.exports = (node, scope) => {
    const lambda = scope.getValue(node.tree[1]);

    if (lambda instanceof BaseLambda) {
        if (lambda.minArgs > 2) {
            throw error(node, 'INFIX_TOO_MANY');
        }

        if (lambda.maxArgs < 2) {
            throw error(node, 'INFIX_FEW_PARAMS');
        }

        const args = [scope.getValue(node.tree[0]), scope.getValue(node.tree[2])];
        return lambda.call(node, args);
    }

    throw error(node, 'TYPE_NOT_USABLE', lambda, 'callable');
};

const error = require('../../Errors');

const BaseLambda = require('../../types/lambdas/BaseLambda');
