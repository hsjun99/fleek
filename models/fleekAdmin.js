const pool = require('../modules/pool');

const table_faqBoard = 'faqBoard';
const aboutLanguage = require('../modules/function/aboutLanguage');

const template = {
    getFaqBoard: async (langCode) => {
        const fields1 = `title_${await aboutLanguage.langCodeToString(langCode)}, content_${await aboutLanguage.langCodeToString(langCode)}`
        const query1 = `SELECT ${fields1} FROM ${table_faqBoard}`;
        try {
            let result1 = await pool.queryParamSlave(query1);
            await Promise.all(result1.map(async (rowdata) => {
                rowdata = await aboutLanguage.rowdataFaq(langCode, rowdata);
            }));
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