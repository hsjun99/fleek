var admin = require('firebase-admin');

module.exports = {
    get: async(table) => {
        return await (await table.once('value')).val();
    },
    update: async(table, content) => {
        await table.update(content);
    }
}
