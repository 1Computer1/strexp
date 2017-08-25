const path = require('path');
const strexp = require('..');

for (const name of ['arithmetic', 'classes', 'comparing', 'events', 'exporting', 'files', 'importing', 'integers', 'switch']) {
    const filepath = path.join(__dirname, `${name}.str`);

    try {
        strexp.runFile(filepath);
    } catch (err) {
        console.error(`Failed at ${name}`);
        throw err;
    }
}
