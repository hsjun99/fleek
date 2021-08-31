let util = require('../modules/util');
let statusCode = require('../modules/statusCode');
let resMessage = require('../modules/responseMessage');


let Dashboard = require("../models/fleekDashboard");

const ageGroupClassifier = require("../modules/classifier/ageGroupClassifier")
const weightGroupClassifier =  require("../modules/classifier/weightGroupClassifier");

module.exports = {
    getData: async(req, res) => {
        const uid = req.uid;
        const myRecord = await Dashboard.getDashboardRecords(uid);
        const myFavoriteWorkouts = await Dashboard.getFavoriteWorkouts(uid);
        await console.log(myRecord)
        // DB Error Handling
        if (myRecord == -1 || myFavoriteWorkouts == -1) {
            return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.READ_DASHBOARD_FAIL));
        }

        // Success
        res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.READ_DASHBOARD_SUCCESS, {my_record: myRecord, my_favorite_workouts: myFavoriteWorkouts}));
    }
}