const pool = require('../modules/pool');
const asyncForEach = require('../modules/function/asyncForEach');

const table_faqBoard = 'faqBoard';

const template = {
    getFaqBoard: async () => {
        const query1 = `SELECT * FROM ${table_faqBoard}`;
        try {
            const result1 = await pool.queryParamSlave(query1);
            return result1;
        } catch (err) {
            if (err.errno == 1062) {
                console.log('getDashboardRecords ERROR: ', err.errno, err.code);
                return -1;
            }
            console.log("getDashboardRecords ERROR: ", err);
            throw err;
        }
    }
}

module.exports = template;