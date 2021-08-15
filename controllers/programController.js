let util = require('../modules/util');
let statusCode = require('../modules/statusCode');
let resMessage = require('../modules/responseMessage');

let Program = require("../models/fleekProgram");
let workoutEquation = require("../models/workoutEquation");
let User = require("../models/fleekUser");

const ageGroupClassifier = require("../modules/classifier/ageGroupClassifier")
const weightGroupClassifier =  require("../modules/classifier/weightGroupClassifier");

const getUserInfo = require('../modules/functionFleek/getUserInfo');

module.exports = {
    getAllPrograms: async(req, res) => {
        const uid = req.uid;
        const programData = await Program.getAllProgram(uid);

        // DB Error Handling
        if (programData == -1) {
            return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.READ_ALLPROGRAM_SUCCESS));
        }

        // Success
        res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.READ_ALLPROGRAM_FAIL, programData));
    },
    getProgramData: async(req, res) => {
        const uid = req.uid;
        const program_id = req.params.program_id;
        const status = await Program.checkProgramUserStatus(uid, program_id);

        // DB Error Handling
        if (status == - 1) {
            return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.READ_EACHPROGRAM_FAIL));
        }
        else if (status == 0) { // Initialization Required
            // Get Profile
            const {sex, age, weight, percentage, ageGroup, weightGroup} = await getUserInfo(uid);
            const programWorkoutData = await Program.getProgramWorkoutsDataByIndex(uid, program_id, sex, ageGroup, weightGroup, percentage, workoutEquation);
            
            // DB Error Handling
            if (programWorkoutData == -1) {
                return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.READ_EACHPROGRAM_FAIL));
            }
            const {workouts_index_default, one_rms_index} = programWorkoutData;
            const result = await Program.initializeProgram(uid, program_id, workouts_index_default, one_rms_index);
            
            // DB Error Handling
            if (result == -1) {
                return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.READ_EACHPROGRAM_FAIL));
            }
        }
        const data = await Program.getProgramData(uid, program_id);

        // DB Error Handling
        if (data == -1) {
            return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.READ_EACHPROGRAM_FAIL));
        }

        // Success
        res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.READ_EACHPROGRAM_SUCCESS, data));
    }
}