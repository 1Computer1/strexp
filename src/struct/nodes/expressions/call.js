module.exports = (node, scope) => {
    const lambda = scope.getValue(node.tree[0]);

    if (lambda instanceof BaseLambda) {
        const args = [];

        for (const arg of node.tree[1]) {
            if (arg.name === 'argSplat') {
                const iterable = scope.getValue(arg.tree[0]);
                if (!iterable || !iterable.iterator) {
                    throw error(node, 'TYPE_NOT_USABLE', iterable, 'iterable');
                }

                const values = Array.from(iterable.iterator(), e => e[1]);
                args.push(...values);
                continue;
            }

            args.push(scope.getValue(arg.tree[0]));
        }

        return lambda.call(node, args);
    }

    throw error(node, 'TYPE_NOT_USABLE', lambda, 'callable');
};

const error = require('../../Errors');

const BaseLambda = require('../../types/lambdas/BaseLambda');
