module.exports = (node, scope) => {
    const [indexPart, declarePart, body] = node.tree;
    const [ident, iterablePart, mod] = declarePart.tree;
    const iterable = scope.getValue(iterablePart);

    if (!iterable || !iterable.iterator) {
        throw error(node, 'TYPE_NOT_USABLE', iterable, 'iterable');
    }

    let ret;
    for (const [i, item] of iterable.iterator()) {
        const newScope = new Scope(scope.program, scope);
        if (indexPart) newScope.variables.set(indexPart.tree[0], i);

        newScope.variables.set(ident, item);
        if (mod === 'const') newScope.constants.add(ident);

        const value = newScope.evaluate(body);
        if (value === Scope.symbolBreak) break;
        if (value === Scope.symbolContinue) continue;
        if (Scope.symbolReturn === ret) {
            return ret;
        }

        ret = value;
    }

    return ret;
};

const Scope = require('../../Scope');
const error = require('../../Errors');
