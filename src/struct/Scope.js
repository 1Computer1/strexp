class Scope {
    constructor(program, parent) {
        this.program = program;
        this.parent = parent;
        this.variables = new Map();
        this.constants = new Set();
    }

    evaluate(ast) {
        let ret = null;
        for (const node of ast) {
            if (Array.isArray(node)) return this.evaluate(node);
            if (node === null || !node.name) continue;

            if (['lambda', 'self', 'symbol'].includes(node.name)) continue;
            if (node.name === 'ellipses') return ret;

            ret = nodes[node.name](node, this);
            if ([symbolBreak, symbolContinue, symbolReturn].includes(ret)) return ret;
        }

        return ret;
    }

    hasVariable(ident) {
        if (this.variables.has(ident)) return true;
        if (!this.parent) return false;
        return this.parent.hasVariable(ident);
    }

    getVariable(ident) {
        if (this.variables.has(ident)) return this.variables.get(ident);
        if (!this.parent) return undefined;
        return this.parent.getVariable(ident);
    }

    setVariable(node, ident, value) {
        if (this.variables.has(ident)) {
            if (this.constants.has(ident)) {
                throw error(node, 'NOT_REASSIGNABLE', ident);
            }

            this.variables.set(ident, value);
            return;
        }

        if (!this.parent) return;
        this.parent.setVariable(node, ident, value);
    }

    returnToLambda(value) {
        if (this instanceof LambdaScope) {
            this.returnValue = value;
            return;
        }

        this.parent.returnToLambda(value);
    }

    getValue(node) {
        if (node === null) return null;

        if (typeof node === 'string') return new StrexpString(node);
        if (node instanceof RegExp) return new StrexpRegExp(node);

        try {
            return nodes[node.name](node, this);
        } catch (err) {
            if (!(err instanceof StrexpError)) {
                if (err.message === 'Maximum call stack size exceeded') {
                    throw error(node, 'MAXIMUM_CALL_STACK_SIZE');
                }
            }

            throw err;
        }
    }
}

class LambdaScope extends Scope {
    constructor(program, parent, lambda) {
        super(program, parent);

        this.lambda = lambda;
        this.returnValue = undefined;
    }

    getReturnValue(statements) {
        this.evaluate(statements);
        return this.returnValue === undefined ? null : this.returnValue;
    }
}

const symbolBreak = Symbol('break');
const symbolContinue = Symbol('continue');
const symbolReturn = Symbol('return');

Scope.LambdaScope = LambdaScope;
Scope.symbolBreak = symbolBreak;
Scope.symbolContinue = symbolContinue;
Scope.symbolReturn = symbolReturn;

module.exports = Scope;

const nodes = require('./nodes/Nodes');
const error = require('./Errors');

const StrexpError = require('./types/StrexpError');
const StrexpRegExp = require('./types/StrexpRegExp');
const StrexpString = require('./types/StrexpString');
