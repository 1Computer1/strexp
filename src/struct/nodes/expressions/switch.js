module.exports = (node, scope) => {
    const testValue = node.tree[0] !== undefined
        ? scope.getValue(node.tree[0])
        : undefined;

    if (testValue !== undefined && !(testValue instanceof StrexpString)) {
        throw error(node, 'TYPE_NOT_USABLE', testValue, 'matchable');
    }

    for (const caseEntry of node.tree[1]) {
        if (caseEntry.name === 'case') {
            const [matchers, trueBranch] = caseEntry.tree;
            const evaluatedMatchers = [];

            for (const matcher of matchers) {
                if (matcher.name === 'itemSplat') {
                    const iterable = scope.getValue(matcher.tree[0]);
                    if (!iterable || !iterable.iterator) {
                        throw error(node, 'TYPE_NOT_USABLE', iterable, 'iterable');
                    }

                    const values = Array.from(iterable.iterator(), e => e[1]);
                    evaluatedMatchers.push(...values);
                    continue;
                }

                evaluatedMatchers.push(scope.getValue(matcher.tree[0]));
            }

            for (const matcher of evaluatedMatchers) {
                if (matcher instanceof BaseLambda) {
                    if (matcher.call(node, [testValue].slice(0, matcher.maxArgs)) !== null) {
                        return new LambdaScope(scope.program, scope).getReturnValue(trueBranch);
                    }
                } else
                if (testValue.property_match.call(node, [matcher]) !== null) {
                    return new LambdaScope(scope.program, scope).getReturnValue(trueBranch);
                }
            }
        } else
        if (caseEntry.name === 'caseWhen') {
            const [expression, trueBranch] = caseEntry.tree;
            if (scope.getValue(expression) !== null) {
                return new LambdaScope(scope.program, scope).getReturnValue(trueBranch);
            }
        } else
        if (caseEntry.name === 'caseDeclare') {
            const [declarePart, trueBranch] = caseEntry.tree;
            const [ident, condition, mod] = declarePart.tree;

            const declaredValue = scope.getValue(condition);
            if (declaredValue !== null) {
                const newScope = new LambdaScope(scope.program, scope);
                newScope.variables.set(ident, declaredValue);
                if (mod === 'const') newScope.constants.add(ident);

                return newScope.getReturnValue(trueBranch);
            }
        } else {
            const branch = node.tree[1];
            return new LambdaScope(scope.program, scope).getReturnValue(branch);
        }
    }

    return null;
};

const { LambdaScope } = require('../../Scope');
const error = require('../../Errors');

const StrexpString = require('../../types/StrexpString');

const BaseLambda = require('../../types/lambdas/BaseLambda');
