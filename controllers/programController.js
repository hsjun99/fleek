let util = require('../modules/util');
let statusCode = require('../modules/statusCode');
let resMessage = require('../modules/responseMessage');

let Program = require("../models/fleekProgram");
let workoutEquation = require("../models/workoutEquation");
let User = require("../models/fleekUser");

const ageGroupClassifier = require("../modules/classifier/ageGroupClassifier")
const weightGroupClassifier =  require("../modules/classifier/weightGroupClassifier");

module.exports = {
    getAllPrograms: async(req, res) => {
        const uid = req.uid;
        const programData = await Program.getAllProgram(uid);
        if (programData == -1) {
            return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.READ_USERTEMPLATE_FAIL));
        }

        // Success
        res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.READ_USERTEMPLATE_SUCCESS, programData));
    },
    getProgramData: async(req, res) => {
        const uid = req.uid;
        const program_id = req.params.program_id;
        const status = await Program.checkProgramUserStatus(uid, program_id);
        if (status == - 1) {
            return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.READ_WORKOUT_FAIL));
        }
        else if (status == false) { // Initialization Required
            // Get Profile
            const profileResult = await User.getProfile(uid);
            if (profileResult == -1){
                return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.READ_WORKOUT_FAIL));
            }
            const {sex, age, height, weight} = profileResult;
            const ageGroup = await ageGroupClassifier(age); // Conversion to group
            const weightGroup = await weightGroupClassifier(weight, sex); // Conversion to group
            const programWorkoutData = await Program.getProgramWorkoutsDataByTier(uid, program_id, sex, ageGroup, weightGroup, workoutEquation);
            const {workouts_by_tier_default, one_rms_by_tier} = programWorkoutData;
            await Program.initializeProgram(uid, program_id, workouts_by_tier_default, one_rms_by_tier);
        }
        const data = await Program.getProgramData(uid, program_id);
        res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.WRITE_TEMPLATE_SUCCESS, data));
    },
    savetemplate: async (req, res) => {
        const uid = req.uid;
        const data = req.body;

        // Post Session
        const templateIdx = await Template.postTemplateData(uid, data.name, data.detail);
        // DB Error Handling
        if (templateIdx == -1) {
            return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.WRITE_TEMPLATE_FAIL));
        }

        // Success
        res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.WRITE_TEMPLATE_SUCCESS, {templateIdx: templateIdx}));
    },
    getUserTemplate: async(req, res) => {
        const uid = req.uid;

        // Get User Template Data
        const templateData = await Template.getUserTemplate(uid);
        // DB Error Handling
        if (templateData == -1) {
            return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.READ_USERTEMPLATE_FAIL));
        }

        // Success
        res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.READ_USERTEMPLATE_SUCCESS, templateData));
    },
    getDefaultTemplate: async(req, res) => {
        // Get Default Template Data
        const templateData = await Template.getDefaultTemplate();
        // DB Error Handling
        if (templateData == -1) {
            return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.READ_DEFAULTTEMPLATE_FAIL));
        }

        // Success
        res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.READ_DEFAULTTEMPLATE_SUCCESS, templateData));
    },
    updateUserTemplate: async(req, res) => {
        const uid = req.uid;
        const template_id = req.params.template_id;
        const data = req.body;

        // Wrong Index Handling
        const flag = await Template.checkTemplate(uid, template_id);
        // DB Error Handling
        if (flag == -1) {
            return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.UPDATE_USERTEMPLATE_FAIL));
        }
        // Wrong Index
        if (flag == false) {
            return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, resMessage.INVALID_USER));
        }

        // Update User Template
        const result = await Template.updateUserTemplate(uid, template_id, data.name, data.detail);
        // DB Error Handling
        if (result == -1) {
            return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.UPDATE_USERTEMPLATE_FAIL));
        }

        // Success
        res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.UPDATE_USERTEMPLATE_SUCCESS, {updated_template_id: template_id}));
    },
    deleteUserTemplate: async(req, res) => {
        const uid = req.uid;
        const template_id = req.params.template_id;

        // Wrong Index Handling
        const flag = await Template.checkTemplate(uid, template_id);
        // DB Error Handling
        if (flag == -1) {
            return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.DELETE_USERTEMPLATE_FAIL));
        }
        // Wrong Index
        if (flag == false) {
            return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, resMessage.INVALID_USER));
        }

        // Delete User Template
        const result = await Template.deleteUserTemplate(uid, template_id);
        // DB Error Handling
        if (result == -1) {
            return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.DELETE_USERTEMPLATE_FAIL));
        }

        // Success
        res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.DELETE_USERTEMPLATE_SUCCESS, {deleted_template_id: template_id}));
    }
}