module.exports = (node, scope) => {
    const string = node.tree[0];

    return new StrexpString(string.replace(/%([A-Za-z0-9_]+(\(\))?|%)/g, (m, ident, call) => {
        if (m === '%%') return '%';
        let toInterp = call
            ? scope.getVariable(ident.replace(/\(\)$/, ''))
            : scope.getVariable(ident);

        if (toInterp === undefined) {
            throw error(node, 'NOT_DEFINED', node.tree[0]);
        }

        if (call) {
            if (!(toInterp instanceof BaseLambda)) {
                throw error(node, 'TYPE_NOT_USABLE', toInterp, 'callable');
            }

            toInterp = toInterp.call(node, []);
        }

        const stringValue = toInterp instanceof StrexpString
            ? toInterp.value
            : toInterp instanceof StrexpRegExp
                ? toInterp.value.source
                : undefined;

        if (stringValue === undefined) {
            throw error(node, 'TYPE_NOT_USABLE', toInterp, 'interpolatable');
        }

        return stringValue;
    }));
};

const error = require('../../Errors');

const StrexpRegExp = require('../../types/StrexpRegExp');
const StrexpString = require('../../types/StrexpString');

const BaseLambda = require('../../types/lambdas/BaseLambda');
