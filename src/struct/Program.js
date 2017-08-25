const fs = require('fs');
const parser = require('../build/strexp');
const path = require('path');

const Scope = require('./Scope');
const Util = require('./Util');
const error = require('./Errors');
const nodes = require('./nodes/Nodes');

const Type = require('./types/Type');
const StrexpArray = require('./types/StrexpArray');
const StrexpDictionary = require('./types/StrexpDictionary');
const StrexpError = require('./types/StrexpError');
const StrexpMatch = require('./types/StrexpMatch');
const StrexpRegExp = require('./types/StrexpRegExp');
const StrexpString = require('./types/StrexpString');
const StrexpSymbol = require('./types/StrexpSymbol');

const BaseLambda = require('./types/lambdas/BaseLambda');
const StrexpLambda = require('./types/lambdas/StrexpLambda');
const SystemLambda = require('./types/lambdas/SystemLambda');

class Program {
    constructor(ast, filepath) {
        this.ast = ast;
        this.filepath = filepath;

        this.moduleScope = null;
        this.parent = null;
        this.imports = new Map();
        this.exports = new Map();

        this.checkASTTree(ast);
    }

    checkASTTree(ast, inside = new Set()) {
        for (const node of ast) {
            if (!node) continue;

            if (ast.name !== 'array' && Array.isArray(node)) {
                this.checkASTTree(node, new Set(inside));
            }

            if (['lambda', 'do', 'switch', 'switchDeclare'].includes(node.name)) {
                inside.clear();
                inside.add('lambda');
            } else
            if (['for', 'forDeclare', 'while', 'until', 'loop'].includes(node.name)) {
                inside.add('loop');
            }

            if (!inside.has('lambda') && node.name === 'return') {
                throw error(node, 'ILLEGAL_RETURN');
            }

            if (!inside.has('loop') && node.name === 'break') {
                throw error(node, 'ILLEGAL_BREAK');
            }

            if (!inside.has('loop') && node.name === 'continue') {
                throw error(node, 'ILLEGAL_CONTINUE');
            }

            if (!node.tree || !node.tree.length) continue;
            this.checkASTTree(node.tree, new Set(inside));
        }
    }

    execute() {
        this.importModule({
            pos: {
                filepath: this.filepath,
                first_line: 1,
                last_line: 1
            }
        }, path.join(Program.getSTDLibPath(), 'global'));

        this.moduleScope = new Scope(this, null);
        this.moduleScope.evaluate(this.ast);
        return this;
    }

    getModulesPath() {
        const main = this.getMainModule();
        return main.filepath
            ? path.join(path.dirname(main.filepath), 'strexp_modules')
            : path.join(process.cwd(), 'strexp_modules');
    }

    getMainModule() {
        const lookup = program => {
            if (!program.parent) return program;
            return lookup(program.parent);
        };

        return lookup(this);
    }

    getGlobalVariable(node, name) {
        const main = this.getMainModule();
        let globalLib = main.imports.get(path.join(Program.getSTDLibPath(), 'global.str'));

        if (!globalLib) {
            this.importModule(node, path.join(Program.getSTDLibPath(), 'global'));
            globalLib = main.imports.get(path.join(Program.getSTDLibPath(), 'global.str'));
        }

        return globalLib.exports.get(name.slice(1));
    }

    importModule(node, filepath) {
        if (!path.isAbsolute(filepath)) {
            filepath = path.resolve(path.join(this.filepath ? path.dirname(this.filepath) : process.cwd(), filepath));
        }

        try {
            if (fs.statSync(filepath).isDirectory()) {
                filepath = path.join(filepath, 'index');
            }
        } catch (err) {
            // ...
        }

        filepath = `${filepath}.str`;

        const main = this.getMainModule();
        let program;

        if (main.imports.has(filepath)) {
            program = main.imports.get(filepath);
        } else {
            if (this.parent) {
                const lookup = parent => {
                    if (!parent) return null;
                    if (parent.filepath === filepath) return parent;
                    return lookup(parent.parent);
                };

                program = lookup(this.parent);
            }

            if (!program) {
                let source;

                try {
                    source = fs.readFileSync(filepath, 'utf-8');
                } catch (err) {
                    throw error(node, 'COULD_NOT_IMPORT', filepath, err.code);
                }

                program = Program.parse(source, filepath);
                program.parent = this;
                program.execute();

                const name = path.basename(filepath).replace(path.extname(filepath), '.str.js');
                const jsPath = path.join(path.dirname(filepath), name);

                let isFile;

                try {
                    isFile = fs.statSync(jsPath).isFile();
                } catch (err) {
                    // ...
                }

                if (isFile) {
                    const mod = require(jsPath);
                    if (typeof mod !== 'function') {
                        throw new TypeError(`JavaScript module '${jsPath}' is not a function`);
                    }

                    const exported = mod(node, this, program, Program);
                    if (Object(exported) !== exported) {
                        throw new TypeError(`JavaScript module '${jsPath}' did not return an object`);
                    }

                    for (const [key, value] of Object.entries(exported)) {
                        if (!Util.isIdentifier(key)) {
                            throw new TypeError(`JavaScript module '${jsPath}' exports invalid identifier '${key}'`);
                        }

                        if (!Util.getType(value)) {
                            throw new TypeError(`JavaScript module '${jsPath}' exports invalid value`);
                        }

                        if (program.exports.has(key)) {
                            throw new TypeError(`JavaScript module '${jsPath}' overrides Strexp export '${key}'`);
                        }

                        program.exports.set(key, value);
                    }
                }
            }

            main.imports.set(filepath, program);
        }

        return program.exports;
    }

    deleteImport(node, filepath) {
        if (!path.isAbsolute(filepath)) {
            filepath = path.resolve(path.join(this.filepath ? path.dirname(this.filepath) : process.cwd(), filepath));
        }

        filepath = `${filepath}.str`;
        const main = this.getMainModule();

        if (main.imports.has(filepath)) {
            main.imports.delete(filepath);

            try {
                const name = path.basename(filepath).replace(path.extname(filepath), '.str.js');
                const jsPath = path.join(path.dirname(filepath), name);

                if (fs.statSync(jsPath).isFile()) {
                    delete require.cache[require.resolve(jsPath)];
                }
            } catch (err) {
                // ...
            }

            return;
        }

        throw error(node, 'COULD_NOT_VOID', filepath);
    }

    exportValue(name, value) {
        this.exports.set(name, value);
        return value;
    }

    static getSTDLibPath() {
        return path.join(__dirname, '..', 'stdlib');
    }

    static generateAST(source, filepath) {
        try {
            return parser.parseSource(source, filepath);
        } catch (err) {
            if (/Parse error on line (.+?):[^]+?, got '(.+?)'/.test(err.message)) {
                const [, line, got] = err.message.match(/Parse error on line (.+?):[^]+?, got '(.+?)'/);
                throw error({
                    pos: {
                        filepath,
                        first_line: line,
                        last_line: line
                    }
                }, 'INVALID_TOKEN', got);
            }

            if (/Lexical error on line (.+?)\..*([^]+?)(.+)$/.test(err.message)) {
                const [, line, got, dashes] = err.message.match(/Lexical error on line (.+?)\..*([^]+?)(.+)$/);
                const char = got.slice(dashes.length)[0];
                throw error({
                    pos: {
                        filepath,
                        first_line: line,
                        last_line: line
                    }
                }, 'INVALID_TOKEN', char);
            }

            if (/this\._input\.match is not a function/.test(err.message)) {
                throw error({
                    pos: {
                        filepath,
                        first_line: 1,
                        last_line: 1
                    }
                }, 'COULD_NOT_PARSE');
            }

            throw err;
        }
    }

    static parse(source, filepath) {
        const ast = this.generateAST(source, filepath);
        return new Program(ast, filepath);
    }
}

Object.assign(Program, {
    Type,
    StrexpArray,
    StrexpDictionary,
    StrexpError,
    StrexpMatch,
    StrexpRegExp,
    StrexpString,
    StrexpSymbol,
    BaseLambda,
    StrexpLambda,
    SystemLambda,
    Scope,
    Util,
    error,
    nodes
});

module.exports = Program;
