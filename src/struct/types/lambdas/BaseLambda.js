const Type = require('../Type');

class BaseLambda extends Type {
    constructor(minArgs, maxArgs) {
        super(null);

        this.minArgs = minArgs;
        this.maxArgs = maxArgs;
    }

    get property_min_args() {
        return new StrexpString(this.minArgs);
    }

    get property_max_args() {
        if (this.maxArgs === Infinity) return null;
        return new StrexpString(this.maxArgs);
    }

    call(node, args) { // eslint-disable-line no-unused-vars
        throw new TypeError('Call not implemented');
    }

    isCallable(node, args) {
        if (args.length < this.minArgs) {
            throw error(node, 'NOT_ENOUGH_ARGS', this.minArgs, args.length);
        }

        if (args.length > this.maxArgs) {
            throw error(node, 'TOO_MANY_ARGS', this.maxArgs, args.length);
        }
    }
}

module.exports = BaseLambda;

const error = require('../../Errors');

const StrexpString = require('../StrexpString');
