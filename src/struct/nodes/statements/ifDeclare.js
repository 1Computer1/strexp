module.exports = (node, scope) => {
    const [declarePart, trueBranch, falseBranch] = node.tree;
    const [ident, condition, mod] = declarePart.tree;
    const result = scope.getValue(condition);

    if (result !== null) {
        const newScope = new Scope(scope.program, scope);
        newScope.variables.set(ident, result);
        if (mod === 'const') newScope.constants.add(ident);
        return newScope.evaluate(trueBranch);
    }

    const newScope = new Scope(scope.program, scope);
    return newScope.evaluate(falseBranch);
};

const Scope = require('../../Scope');
