const fs = require('fs');
const path = require('path');

const read = folder => fs.readdirSync(path.join(__dirname, folder))
    .map(file => path.join(__dirname, folder, file));

const files = [...read('statements'), ...read('expressions')];
const nodes = {};

if (!Object.keys(nodes).length) {
    for (const file of files) {
        const name = path.basename(file).replace(path.extname(file), '');
        const fn = require(file);
        nodes[name] = fn;
    }
}

module.exports = nodes;
