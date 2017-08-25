module.exports = (node, scope) => {
    const lh = scope.getValue(node.tree[0]);

    if (lh instanceof StrexpString || lh instanceof StrexpRegExp) {
        const rh = scope.getValue(node.tree[1]);
        const toConcat = rh instanceof StrexpString
            ? rh.value
            : rh instanceof StrexpRegExp
                ? rh.value.source
                : undefined;

        if (rh === undefined) {
            throw error(node, 'TYPE_NOT_USABLE', rh, 'concatenatable');
        }

        if (lh instanceof StrexpString) return new StrexpString(lh.value + toConcat);

        const regexp = StrexpRegExp.buildRegExp(node, lh.value.source + toConcat, lh.value.flags);
        return new StrexpRegExp(regexp);
    }

    throw error(node, 'TYPE_NOT_USABLE', lh, 'concatenatable');
};

const error = require('../../Errors');

const StrexpRegExp = require('../../types/StrexpRegExp');
const StrexpString = require('../../types/StrexpString');
