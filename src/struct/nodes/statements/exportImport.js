module.exports = (node, scope) => {
    const filepath = scope.getValue(node.tree[0]);
    const ident = node.tree[1];

    if (!(filepath instanceof StrexpString)) {
        throw error(node, 'TYPE_NOT_USABLE', filepath, 'usable as filepath');
    }

    const imports = scope.program.importModule(node, filepath.value);

    if (Array.isArray(ident)) {
        for (const [id, exportID] of ident) {
            if (!imports.has(id)) {
                throw error(node, 'EXPORT_NOT_EXIST', id);
            }

            scope.program.exportValue(exportID, imports.get(id));
        }

        return null;
    }

    if (ident === undefined) {
        for (const [key, value] of imports) {
            scope.program.exportValue(key, value);
        }

        return null;
    }

    const value = new StrexpDictionary(imports);
    value.frozen = true;

    scope.program.exportValue(ident, value);
    return value;
};

const error = require('../../Errors');

const StrexpDictionary = require('../../types/StrexpDictionary');
const StrexpString = require('../../types/StrexpString');
