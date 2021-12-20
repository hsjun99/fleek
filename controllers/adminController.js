let util = require('../modules/util');
let statusCode = require('../modules/statusCode');
let resMessage = require('../modules/responseMessage');

let Admin = require('../models/fleekAdmin');
const { lang } = require('moment');

module.exports = {
    getFaqBoard: async (req, res) => {
        const langCode = req.lang_code;
        // Get Calendar Data
        const data = await Admin.getFaqBoard(langCode);
        // DB Error Handling
        if (data == -1) {
            return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.READ_CALENDAR_FAIL));
        }

        // Success
        res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.READ_CALENDAR_SUCCESS, data));
    }
}