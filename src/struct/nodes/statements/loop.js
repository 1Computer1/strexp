module.exports = (node, scope) => {
    const [body] = node.tree;

    let ret;
    while (true) { // eslint-disable-line no-constant-condition
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
