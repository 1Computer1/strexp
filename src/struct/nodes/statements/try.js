module.exports = (node, scope) => {
    const [tryPart, declarePart, catchPart] = node.tree;

    try {
        const newScope = new Scope(scope.program, scope);
        return newScope.evaluate(tryPart);
    } catch (err) {
        if (!(err instanceof StrexpError)) {
            throw err;
        }

        if (catchPart) {
            const newScope = new Scope(scope.program, scope);
            if (declarePart) {
                const [ident] = declarePart.tree;
                newScope.variables.set(ident, err);
            }

            return newScope.evaluate(catchPart);
        }

        return null;
    }
};

const Scope = require('../../Scope');

const StrexpError = require('../../types/StrexpError');
