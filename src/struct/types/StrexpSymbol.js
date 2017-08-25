const Type = require('./Type');

class StrexpSymbol extends Type {
    constructor(name) {
        if (!Util.isIdentifier(name)) {
            throw new TypeError('Symbol name must be a valid identifier');
        }

        super(Symbol(name));

        this.name = name;
    }

    get property_name() {
        return new StrexpString(this.name);
    }
}

module.exports = StrexpSymbol;

const Util = require('../Util');

const StrexpString = require('./StrexpString');
