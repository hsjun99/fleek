let util = require('../modules/util');
let statusCode = require('../modules/statusCode');
let resMessage = require('../modules/responseMessage');

let Workout = require("../models/fleekWorkout")
let WorkoutAbility = require('../models/fleekWorkoutAbility');

module.exports = {
    getData: async (req, res) => {
        const uid = req.uid;
        const data = await Workout.getCalendarData(uid);
        if (data == -1) {
            return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.DB_ERROR));
        }
        res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.WRITE_SESSION_SUCCESS, data));
    }
}