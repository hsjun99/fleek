let util = require('../modules/util');
let statusCode = require('../modules/statusCode');
let resMessage = require('../modules/responseMessage');

var moment = require("moment");

let Session = require("../models/fleekSession");

const asyncForEach = require('../modules/function/asyncForEach');

module.exports = {
    savesession: async (req, res) => {
        const uid = req.uid;
        const data = req.body;
        const now = moment();
        const created_at = await now.format("YYYY-MM-DD HH:mm:ss");
        const sessionIdx = await Session.postSessionData(uid, data.session, created_at, data.template_id);
        if (sessionIdx == -1) {
            return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.DB_ERROR));
        }
        
        const fav_workout_list = [];
        
        await Session.updateFavworkout(uid, fav_workout_list);
    
        res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.WRITE_SESSION_SUCCESS, {sessionIdx: sessionIdx}));
    }
}