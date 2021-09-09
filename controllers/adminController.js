let util = require('../modules/util');
let statusCode = require('../modules/statusCode');
let resMessage = require('../modules/responseMessage');

let Admin = require('../models/fleekAdmin');

module.exports = {
    getFaqBoard: async (req, res) => {
        // Get Calendar Data
        const data = await Admin.getFaqBoard();
        // DB Error Handling
        if (data == -1) {
            return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.READ_CALENDAR_FAIL));
        }

        // Success
        res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.READ_CALENDAR_SUCCESS, data));
    }
}