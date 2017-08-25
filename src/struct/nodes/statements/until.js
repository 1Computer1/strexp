module.exports = (node, scope) => {
    const [condition, body] = node.tree;

    let ret;
    while (scope.getValue(condition) === null) {
        const value = new Scope(scope.program, scope).evaluate(body);
        if (value === Scope.symbolBreak) break;
        if (value === Scope.symbolContinue) continue;
        if (value === Scope.symbolReturn) {
            return value;
        }

        ret = value;
    }

    return ret;
};

const Scope = require('../../Scope');
