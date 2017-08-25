const fs = require('fs');
const minimist = require('minimist');
const path = require('path');
const Program = require('./struct/Program');

if (require.main === module) {
    const args = minimist(process.argv.slice(2));
    const filepath = args._[0] || args.input || args.i;

    if (filepath) {
        const source = fs.readFileSync(path.resolve(filepath), 'utf-8');
        Program.parse(source, path.resolve(filepath)).execute();
    } else
    if (args.code || args.c) {
        Program.parse(args.code || args.c, null).execute();
    }
}

module.exports = {
    runFile: filepath => {
        const source = fs.readFileSync(path.resolve(filepath), 'utf-8');
        Program.parse(source, path.resolve(filepath)).execute();
    },
    runCode: source => {
        Program.parse(source || '', null).execute();
    }
};
