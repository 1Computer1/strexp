const path = require('path');

module.exports = (node, scope) => {
    const filepath = scope.getValue(node.tree[0]);
    const [, ident, type] = node.tree;

    if (!(filepath instanceof StrexpString)) {
        throw error(node, 'TYPE_NOT_USABLE', filepath, 'usable as filepath');
    }

    if (typeof ident === 'string' && scope.variables.has(ident)) {
        throw error(node, 'REDECLARATION', ident);
    } else
    if (Array.isArray(ident)) {
        for (const [, importID] of ident) {
            if (scope.variables.has(importID)) {
                throw error(node, 'REDECLARATION', importID);
            }
        }
    }

    const main = scope.program.getMainModule();
    const modPath = type === 'rel'
        ? filepath.value
        : main.filepath
            ? path.join(path.dirname(main.filepath), filepath.value)
            : path.join(process.cwd(), filepath.value);

    const imports = scope.program.importModule(node, modPath);

    if (Array.isArray(ident)) {
        for (const [id, importID] of ident) {
            if (scope.variables.has(importID)) {
                throw error(node, 'REDECLARATION', importID);
            }

            if (!imports.has(id)) {
                throw error(node, 'EXPORT_NOT_EXIST', id);
            }

            scope.variables.set(importID, imports.get(id));
            scope.constants.add(importID);
        }

        return null;
    }

    if (ident === undefined) {
        for (const [key, value] of imports) {
            if (scope.variables.has(key)) {
                throw error(node, 'REDECLARATION', key);
            }

            scope.variables.set(key, value);
            scope.constants.add(key);
        }

        return null;
    }

    const value = new StrexpDictionary(imports);
    value.frozen = true;

    scope.variables.set(ident, value);
    scope.constants.add(ident);
    return value;
};

const error = require('../../Errors');

const StrexpDictionary = require('../../types/StrexpDictionary');
const StrexpString = require('../../types/StrexpString');
