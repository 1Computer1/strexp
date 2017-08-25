module.exports = (node, scope) => {
    const lookup = s => {
        if (s instanceof LambdaScope && s.lambda) {
            return s.lambda;
        }

        if (!s.parent) return null;
        return lookup(s.parent);
    };

    const lambda = lookup(scope);
    if (!lambda) {
        throw error(node, 'NOT_WITHIN_FUNCTION');
    }

    return lambda;
};

const error = require('../../Errors');

const { LambdaScope } = require('../../Scope');
