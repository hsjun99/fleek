module.exports = {
    sessionFinish: async () => {
        return await (await table.once('value')).val();
    },
    sessionLike: async (table, content) => {
        await table.update(content);
    }
}
