const BaseLambda = require('./BaseLambda');

class StrexpLambda extends BaseLambda {
    constructor(closure, params, body) {
        const min = params.filter(param => param.tree[1] === undefined).length;
        let max = params.length;

        const last = params.slice(-1)[0];
        if (last && last.name === 'paramRest') {
            if (last.tree[1] === Infinity) {
                max = Infinity;
            } else {
                const amount = closure.getValue(last.tree[1]);
                if (!(amount instanceof StrexpString)) {
                    throw error(last, 'TYPE_NOT_USABLE', amount, 'usable as an amount of parameters');
                }

                if (!Util.isInteger(amount.value)) {
                    throw error(last, 'VALUE_NOT_USABLE', amount, 'usable as an amount of parameters');
                }

                max--;
                max += Number(amount.value);
            }
        }

        super(min, max);

        this.closure = closure;
        this.params = params;
        this.body = body;
        this.program = closure.program;
    }

    call(node, args) {
        this.isCallable(node, args);
        const scope = new LambdaScope(this.program, this.closure, this);

        for (const [i, param] of this.params.entries()) {
            const [ident, defaultValue, mod] = param.tree;
            let argValue;

            if (ident === '_') {
                argValue = null;
            } else
            if (param.name === 'paramRest') {
                argValue = new StrexpArray(args.slice(i));
            } else {
                argValue = args[i] === undefined
                    ? scope.getValue(defaultValue)
                    : args[i];
            }

            scope.variables.set(ident, argValue);
            if (mod === 'const') scope.constants.add(ident);
        }

        return scope.getReturnValue(this.body);
    }

    bind(node, args) {
        if (args.length > this.maxArgs) {
            throw error(node, 'TOO_MANY_BOUND', this.maxArgs, args.length);
        }

        let min = this.minArgs;
        let max = this.maxArgs;

        for (const [i, arg] of args.entries()) {
            if (i >= this.minArgs) {
                if (arg !== undefined) max--;
            } else
            if (arg !== undefined) {
                min--;
                max--;
            }
        }

        return new SystemLambda(min, max, (node2, ...args2) => {
            const evaluatedArgs = [];

            args2 = args2.slice(0);
            const len = args.filter(a => a !== undefined).length + args2.length;

            for (let i = 0; i < len; i++) {
                if (args[i] === undefined) {
                    evaluatedArgs.push(args2.shift());
                    continue;
                }

                evaluatedArgs.push(args[i]);
            }

            return this.call(node2, evaluatedArgs);
        });
    }
}

module.exports = StrexpLambda;

const { LambdaScope } = require('../../Scope');
const Util = require('../../Util');
const error = require('../../Errors');

const StrexpArray = require('../StrexpArray');
const StrexpString = require('../StrexpString');

const SystemLambda = require('./SystemLambda');
