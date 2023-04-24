const fs = require('fs').promises

async function writeConv(conv, filename) {
    try {
        await fs.writeFile(filename, conv)
    }
    catch(err) {
        console.error(`error writing to file ${filename}\n` + err)
    }
    return true
}

async function readConv(filename) {
    try {
        return await fs.readFile(filename, 'utf-8')
    }
    catch(err) {
        console.error(`error reading from file ${filename}\n` + err)
    }
}

module.exports = { writeConv, readConv }