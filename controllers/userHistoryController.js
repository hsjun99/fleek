let util = require('../modules/util');
let statusCode = require('../modules/statusCode');
let resMessage = require('../modules/responseMessage');

let Workout = require("../models/fleekWorkout")
let WorkoutAbility = require('../models/fleekWorkoutAbility');
let User = require('../models/fleekUser');

const ageGroupClassifier = require('../modules/classifier/ageGroupClassifier');
const weightGroupClassifier = require('../modules/classifier/weightGroupClassifier');

module.exports = {
    getUserHistoryData: async (req, res) => {
        const uid = req.uid;
        const mobileLastUpdateTime = req.headers.last_update_time;
        
        const profileResult = await User.getProfile(uid);
        const { sex, age, weight } = profileResult;
        const [ageGroup, weightGroup] = await Promise.all([await ageGroupClassifier(age), await weightGroupClassifier(weight, sex)]);

        let data = [];
        
        // if (mobileLastUpdateTime == null || mobileLastUpdateTime == undefined) {

        // Get Calendar Data
        data = await Workout.getUserHistoryDataAll(uid, sex, ageGroup, weightGroup);
        // DB Error Handling
        if (data == -1) {
            return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.READ_CALENDAR_FAIL));
        }
        
        // }
        // else {
        //     data = await Workout.getUserHistoryDataPartial(uid, sex, ageGroup, weightGroup, mobileLastUpdateTime);
        //     // DB Error Handling
        //     if (data == -1) {
        //         return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.READ_CALENDAR_FAIL));
        //     }
        // }
        let update_time = Math.floor(Date.now() / 1000);
    
        // Success
        res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.READ_CALENDAR_SUCCESS, data, update_time));
    }
}