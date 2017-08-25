const Type = require('./Type');

class StrexpError extends Type {
    constructor(node, type, message) {
        super(null);

        this.node = node;
        this.type = type;
        this.message = message;
    }

    get property_type() {
        return new StrexpString(this.type);
    }

    get property_lines() {
        return new StrexpArray([
            new StrexpString(this.node.pos.first_line),
            new StrexpString(this.node.pos.last_line)
        ]);
    }

    get property_message() {
        return new StrexpString(this.message);
    }

    get property_filepath() {
        if (!this.node.pos.filepath) return null;
        return new StrexpString(this.node.pos.filepath);
    }

    get property_string() {
        return new StrexpString(this.toString());
    }

    toString() {
        return [
            `${this.type}Error: ${this.message}`,
            `    at ${this.node.pos.filepath || '<eval>'}`,
            `    at ${this.node.pos.first_line}-${this.node.pos.last_line}`
        ].join('\n');
    }
}

module.exports = StrexpError;

const StrexpArray = require('./StrexpArray');
const StrexpString = require('./StrexpString');
