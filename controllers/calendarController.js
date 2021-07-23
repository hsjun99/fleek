let util = require('../modules/util');
let statusCode = require('../modules/statusCode');
let resMessage = require('../modules/responseMessage');

let Workout = require("../models/fleekWorkout")
let WorkoutAbility = require('../models/fleekWorkoutAbility');

module.exports = {
    getData: async (req, res) => {
        const uid = req.uid;

        // Get Calendar Data
        const data = await Workout.getCalendarData(uid);
        // DB Error Handling
        if (data == -1) {
            return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.READ_CALENDAR_FAIL));
        }

        // Success
        res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.READ_CALENDAR_SUCCESS, data));
    }
}