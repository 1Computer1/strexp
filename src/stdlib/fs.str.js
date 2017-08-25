const fs = require('fs');

module.exports = (importNode, program, linkedProgram, { error, StrexpArray, StrexpString, BaseLambda, SystemLambda }) => ({
    read: new SystemLambda(2, 2, (node, filepath, callback) => {
        if (!(filepath instanceof StrexpString)) {
            throw error(node, 'TYPE_NOT_USABLE', filepath, 'usable as filepath');
        }

        if (!(callback instanceof BaseLambda)) {
            throw error(node, 'TYPE_NOT_USABLE', callback, 'callable');
        }

        fs.readFile(filepath.value, 'utf-8', (err, data) => {
            if (err) {
                callback.call(node, [error(node, 'COULD_NOT_PERFORM', filepath.value, 'read', err.code), null]);
                return;
            }

            callback.call(node, [null, new StrexpString(data)]);
        });
    }),

    read_sync: new SystemLambda(1, 1, (node, filepath) => {
        if (!(filepath instanceof StrexpString)) {
            throw error(node, 'TYPE_NOT_USABLE', filepath, 'usable as filepath');
        }

        try {
            const data = fs.readFileSync(filepath.value, 'utf-8');
            return new StrexpString(data);
        } catch (err) {
            throw error(node, 'COULD_NOT_PERFORM', filepath.value, 'read', err.code);
        }
    }),

    write: new SystemLambda(3, 3, (node, filepath, data, callback) => {
        if (!(filepath instanceof StrexpString)) {
            throw error(node, 'TYPE_NOT_USABLE', filepath, 'usable as filepath');
        }

        if (!(data instanceof StrexpString)) {
            throw error(node, 'TYPE_NOT_USABLE', data, 'usable as data');
        }

        if (!(callback instanceof BaseLambda)) {
            throw error(node, 'TYPE_NOT_USABLE', callback, 'callable');
        }

        fs.writeFile(filepath.value, data.value, err => {
            if (err) {
                callback.call(node, [error(node, 'COULD_NOT_PERFORM', filepath.value, 'write to', err.code)]);
                return;
            }

            callback.call(node, [null]);
        });
    }),

    write_sync: new SystemLambda(2, 2, (node, filepath, data) => {
        if (!(filepath instanceof StrexpString)) {
            throw error(node, 'TYPE_NOT_USABLE', filepath, 'usable as filepath');
        }

        if (!(data instanceof StrexpString)) {
            throw error(node, 'TYPE_NOT_USABLE', data, 'usable as data');
        }

        try {
            fs.writeFileSync(filepath.value, data.value);
        } catch (err) {
            throw error(node, 'COULD_NOT_PERFORM', filepath.value, 'write to', err.code);
        }
    }),

    rename: new SystemLambda(3, 3, (node, filepath, newPath, callback) => {
        if (!(filepath instanceof StrexpString)) {
            throw error(node, 'TYPE_NOT_USABLE', filepath, 'usable as path');
        }

        if (!(newPath instanceof StrexpString)) {
            throw error(node, 'TYPE_NOT_USABLE', newPath, 'usable as path');
        }

        if (!(callback instanceof BaseLambda)) {
            throw error(node, 'TYPE_NOT_USABLE', callback, 'callable');
        }

        fs.rename(filepath.value, newPath.value, err => {
            if (err) {
                callback.call(node, [error(node, 'COULD_NOT_PERFORM', filepath.value, 'rename', err.code)]);
                return;
            }

            callback.call(node, [null]);
        });
    }),

    rename_sync: new SystemLambda(2, 2, (node, filepath, newPath) => {
        if (!(filepath instanceof StrexpString)) {
            throw error(node, 'TYPE_NOT_USABLE', filepath, 'usable as path');
        }

        if (!(newPath instanceof StrexpString)) {
            throw error(node, 'TYPE_NOT_USABLE', newPath, 'usable as path');
        }

        try {
            fs.renameSync(filepath.value);
        } catch (err) {
            throw error(node, 'COULD_NOT_PERFORM', filepath.value, 'rename', err.code);
        }
    }),

    delete: new SystemLambda(2, 2, (node, filepath, callback) => {
        if (!(filepath instanceof StrexpString)) {
            throw error(node, 'TYPE_NOT_USABLE', filepath, 'usable as filepath');
        }

        if (!(callback instanceof BaseLambda)) {
            throw error(node, 'TYPE_NOT_USABLE', callback, 'callable');
        }

        fs.unlink(filepath.value, err => {
            if (err) {
                callback.call(node, [error(node, 'COULD_NOT_PERFORM', filepath.value, 'delete file', err.code)]);
                return;
            }

            callback.call(node, [null]);
        });
    }),

    delete_sync: new SystemLambda(1, 1, (node, filepath) => {
        if (!(filepath instanceof StrexpString)) {
            throw error(node, 'TYPE_NOT_USABLE', filepath, 'usable as filepath');
        }

        try {
            fs.unlinkSync(filepath.value);
        } catch (err) {
            throw error(node, 'COULD_NOT_PERFORM', filepath.value, 'delete file', err.code);
        }
    }),

    isfile: new SystemLambda(2, 2, (node, filepath, callback) => {
        if (!(filepath instanceof StrexpString)) {
            throw error(node, 'TYPE_NOT_USABLE', filepath, 'usable as filepath');
        }

        if (!(callback instanceof BaseLambda)) {
            throw error(node, 'TYPE_NOT_USABLE', callback, 'callable');
        }

        fs.stat(filepath.value, (err, stats) => {
            if (err) {
                callback.call(node, [error(node, 'COULD_NOT_PERFORM', filepath.value, 'check', err.code), null]);
                return;
            }

            if (stats.isFile()) {
                callback.call(node, [null, new StrexpString(filepath.value)]);
            } else {
                callback.call(node, [null, null]);
            }
        });
    }),

    isfile_sync: new SystemLambda(1, 1, (node, filepath) => {
        if (!(filepath instanceof StrexpString)) {
            throw error(node, 'TYPE_NOT_USABLE', filepath, 'usable as path');
        }

        try {
            const stats = fs.statSync(filepath.value);
            if (stats.isFile()) {
                return new StrexpString(filepath.value);
            }

            return null;
        } catch (err) {
            throw error(node, 'COULD_NOT_PERFORM', filepath.value, 'check', err.code);
        }
    }),

    isdir: new SystemLambda(2, 2, (node, filepath, callback) => {
        if (!(filepath instanceof StrexpString)) {
            throw error(node, 'TYPE_NOT_USABLE', filepath, 'usable as path');
        }

        if (!(callback instanceof BaseLambda)) {
            throw error(node, 'TYPE_NOT_USABLE', callback, 'callable');
        }

        fs.stat(filepath.value, (err, stats) => {
            if (err) {
                callback.call(node, [error(node, 'COULD_NOT_PERFORM', filepath.value, 'check', err.code), null]);
                return;
            }

            if (stats.isDirectory()) {
                callback.call(node, [null, new StrexpString(filepath.value)]);
            } else {
                callback.call(node, [null, null]);
            }
        });
    }),

    isdir_sync: new SystemLambda(1, 1, (node, filepath) => {
        if (!(filepath instanceof StrexpString)) {
            throw error(node, 'TYPE_NOT_USABLE', filepath, 'usable as path');
        }

        try {
            const stats = fs.statSync(filepath.value);
            if (stats.isDirectory()) {
                return new StrexpString(filepath.value);
            }

            return null;
        } catch (err) {
            throw error(node, 'COULD_NOT_PERFORM', filepath.value, 'check', err.code);
        }
    }),

    readdir: new SystemLambda(2, 2, (node, filepath, callback) => {
        if (!(filepath instanceof StrexpString)) {
            throw error(node, 'TYPE_NOT_USABLE', filepath, 'usable as path');
        }

        if (!(callback instanceof BaseLambda)) {
            throw error(node, 'TYPE_NOT_USABLE', callback, 'callable');
        }

        fs.readdir(filepath.value, (err, files) => {
            if (err) {
                callback.call(node, [error(node, 'COULD_NOT_PERFORM', filepath.value, 'read directory', err.code), null]);
                return;
            }

            callback.call(node, [null, new StrexpArray(files.map(f => new StrexpString(f)))]);
        });
    }),

    readdir_sync: new SystemLambda(1, 1, (node, filepath) => {
        if (!(filepath instanceof StrexpString)) {
            throw error(node, 'TYPE_NOT_USABLE', filepath, 'usable as path');
        }

        try {
            const files = fs.readdirSync(filepath.value);
            return new StrexpArray(files.map(f => new StrexpString(f)));
        } catch (err) {
            throw error(node, 'COULD_NOT_PERFORM', filepath.value, 'read directory', err.code);
        }
    }),

    mkdir: new SystemLambda(2, 2, (node, filepath, callback) => {
        if (!(filepath instanceof StrexpString)) {
            throw error(node, 'TYPE_NOT_USABLE', filepath, 'usable as path');
        }

        if (!(callback instanceof BaseLambda)) {
            throw error(node, 'TYPE_NOT_USABLE', callback, 'callable');
        }

        fs.mkdir(filepath.value, err => {
            if (err) {
                callback.call(node, [error(node, 'COULD_NOT_PERFORM', filepath.value, 'make directory', err.code)]);
                return;
            }

            callback.call(node, [null]);
        });
    }),

    mkdir_sync: new SystemLambda(1, 1, (node, filepath) => {
        if (!(filepath instanceof StrexpString)) {
            throw error(node, 'TYPE_NOT_USABLE', filepath, 'usable as path');
        }

        try {
            fs.mkdirSync(filepath.value);
        } catch (err) {
            throw error(node, 'COULD_NOT_PERFORM', filepath.value, 'make directory', err.code);
        }
    }),

    rmdir: new SystemLambda(2, 2, (node, filepath, callback) => {
        if (!(filepath instanceof StrexpString)) {
            throw error(node, 'TYPE_NOT_USABLE', filepath, 'usable as path');
        }

        if (!(callback instanceof BaseLambda)) {
            throw error(node, 'TYPE_NOT_USABLE', callback, 'callable');
        }

        fs.rmdir(filepath.value, err => {
            if (err) {
                callback.call(node, [error(node, 'COULD_NOT_PERFORM', filepath.value, 'delete directory', err.code)]);
                return;
            }

            callback.call(node, [null]);
        });
    }),

    rmdir_sync: new SystemLambda(1, 1, (node, filepath) => {
        if (!(filepath instanceof StrexpString)) {
            throw error(node, 'TYPE_NOT_USABLE', filepath, 'usable as path');
        }

        try {
            fs.rmdirSync(filepath.value);
        } catch (err) {
            throw error(node, 'COULD_NOT_PERFORM', filepath.value, 'delete directory', err.code);
        }
    })
});
