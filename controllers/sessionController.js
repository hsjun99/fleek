let util = require('../modules/util');
let statusCode = require('../modules/statusCode');
let resMessage = require('../modules/responseMessage');

var moment = require("moment");

let Session = require("../models/fleekSession");

module.exports = {
    savesession: async (req, res) => {
        const uid = req.uid;
        const data = req.body;
        console.log(data);
        const now = moment();
        const created_at = await now.format("YYYY-MM-DD HH:mm:ss");
        const sessionIdx = await Session.postSessionData(uid, data, created_at);
        // *****Error Handling Required*****
        res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.WRITE_SESSION_SUCCESS, {sessionIdx: sessionIdx}));
    }
}