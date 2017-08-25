const Type = require('./Type');

class StrexpRegExp extends Type {
    constructor(value) {
        if (!(value instanceof RegExp)) {
            throw new TypeError('`value` must be a RegExp object');
        }

        super(value);
    }

    get property_concat() {
        return new SystemLambda(1, Infinity, (node, ...regexps) => {
            return new StrexpRegExp(regexps.reduce((res, curr) => {
                if (!(curr instanceof StrexpRegExp)) {
                    throw error(node, 'TYPE_NOT_USABLE', curr, 'concatenatable');
                }

                return StrexpRegExp.buildRegExp(node, res.source + curr.value.source, this.value.flags);
            }, this.value));
        });
    }

    get property_flags() {
        return new StrexpString(this.value.flags);
    }

    get property_source() {
        return new StrexpString(this.value.source);
    }

    get property_string() {
        return new SystemLambda(0, 0, () => {
            return new StrexpString(this.value.toString());
        });
    }

    static buildRegExp(node, source, flags) {
        try {
            return new RegExp(source, flags);
        } catch (err) {
            if (err.message.match(/Invalid regular expression: (.+)/)) {
                const msg = err.message.match(/Invalid regular expression: (.+):.+/)[1];
                throw error(node, 'INVALID_REGEXP_PATTERN', msg);
            }

            if (err.message.match(/Invalid flags supplied to RegExp constructor (.+)/)) {
                const msg = err.message.match(/Invalid flags supplied to RegExp constructor (.+)/)[1];
                throw error(node, 'INVALID_REGEXP_FLAGS', msg);
            }

            throw err;
        }
    }
}

module.exports = StrexpRegExp;

const error = require('../Errors');

const StrexpString = require('./StrexpString');

const SystemLambda = require('./lambdas/SystemLambda');
