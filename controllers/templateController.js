let util = require('../modules/util');
let statusCode = require('../modules/statusCode');
let resMessage = require('../modules/responseMessage');

let Template = require("../models/fleekTemplate");

module.exports = {
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
    importDefaultTemplate: async(req, res) => {
        const uid = req.uid;
        const default_template_group_id = req.params.group_id;
        const index = req.params.index;
        const templateIdx = await Template.postDefaultTemplateData(uid, default_template_group_id, index);

        if (templateIdx == -1) {
            return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.UPDATE_USERTEMPLATE_FAIL));
        }

        // Success
        res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.WRITE_TEMPLATE_SUCCESS, {templateIdx: templateIdx}));
    },
    updateUserTemplate: async(req, res) => {
        const uid = req.uid;
        const template_id = req.params.template_id;
        const data = req.body;
        console.log("UPDATE DATA: ", data)

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