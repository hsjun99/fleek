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
        console.log(myRecord, myFavoriteWorkouts)
        res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.READ_USERTEMPLATE_SUCCESS, {my_record: myRecord, my_favorite_workouts: myFavoriteWorkouts}));
        /*
        const programData = await Program.getAllProgram(uid);
        if (programData == -1) {
            return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.READ_USERTEMPLATE_FAIL));
        }

        // Success
        res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.READ_USERTEMPLATE_SUCCESS, programData));
        */
    }
}