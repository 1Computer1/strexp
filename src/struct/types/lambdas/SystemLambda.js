const BaseLambda = require('./BaseLambda');

class SystemLambda extends BaseLambda {
    constructor(minArgs, maxArgs, fn) {
        if (typeof minArgs !== 'number' || typeof maxArgs !== 'number') {
            throw new TypeError('Argument counts must be numbers');
        }

        if (typeof fn !== 'function') {
            throw new TypeError('`fn` must be a function');
        }

        super(minArgs, maxArgs);

        this.fn = fn;
    }

    call(node, args) {
        this.isCallable(node, args);
        let returnValue = this.fn(node, ...args);
        if (returnValue === undefined) returnValue = null;

        if (!Util.getType(returnValue)) {
            throw new TypeError('Return value is not compatible');
        }

        return returnValue;
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

            args = args.slice(0);
            args2 = args2.slice(0);

            while (args.length || args2.length) {
                const arg = args.shift();

                if (arg === undefined) {
                    const arg2 = args2.shift();
                    if (arg2 !== undefined) evaluatedArgs.push(arg2);
                    continue;
                }

                evaluatedArgs.push(arg);
            }

            return this.call(node2, evaluatedArgs);
        });
    }
}

module.exports = SystemLambda;

const Util = require('../../Util');
const error = require('../../Errors');
