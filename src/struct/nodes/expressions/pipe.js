module.exports = (node, scope) => {
    const lambda = scope.getValue(node.tree[1]);

    if (lambda instanceof BaseLambda) {
        if (lambda.minArgs > 1) {
            throw error(node, 'PIPE_TOO_MANY');
        }

        if (lambda.maxArgs < 1) {
            throw error(node, 'PIPE_NO_PARAMS');
        }

        const args = [scope.getValue(node.tree[0])];
        return lambda.call(node, args);
    }

    throw error(node, 'TYPE_NOT_USABLE', lambda, 'callable');
};

const error = require('../../Errors');

const BaseLambda = require('../../types/lambdas/BaseLambda');
