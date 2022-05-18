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
        let update_time = Math.floor(Date.now() / 1000);
        // Success
        res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.WRITE_TEMPLATE_SUCCESS, [await Template.getUserTemplateByTemplateId(templateIdx)], update_time));

        await Template.postTemplateSyncFirebase(uid, update_time);
    },
    getOneUserTemplate: async (req, res) => {
        const templateId = req.params.template_id;
        let templateData;
        // Get User Template Data
        templateData = await Template.getOneUserTemplate(templateId);
        // DB Error Handling
        if (templateData == -1) {
            return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.READ_USERTEMPLATE_FAIL));
        }
        // Success
        res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.READ_USERTEMPLATE_SUCCESS, templateData));
    },
    getUserTemplate: async (req, res) => {
        console.log('hello')
        const uid = req.uid;
        let templateData;
        // Get User Template Data
        templateData = await Template.getUserTemplate(uid);
        // DB Error Handling
        if (templateData == -1) {
            return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.READ_USERTEMPLATE_FAIL));
        }
        let update_time = Math.floor(Date.now() / 1000);
        // Success
        res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.READ_USERTEMPLATE_SUCCESS, templateData, update_time));
    },
    getUserTemplateWear: async (req, res) => {
        const uid = req.uid;
        const langCode = req.lang_code;
        let templateData;
        // Get User Template Data
        templateData = await Template.getUserTemplateWear(uid, langCode);
        // DB Error Handling
        if (templateData == -1) {
            return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.READ_USERTEMPLATE_FAIL));
        }
        // Success
        res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.READ_USERTEMPLATE_SUCCESS, templateData));
    },
    getDefaultTemplate: async (req, res) => {
        // Get Default Template Data
        const langCode = req.lang_code;
        const templateData = await Template.getDefaultTemplate(langCode);
        // DB Error Handling
        if (templateData == -1) {
            return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.READ_DEFAULTTEMPLATE_FAIL));
        }

        // Success
        res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.READ_DEFAULTTEMPLATE_SUCCESS, templateData));
    },
    importDefaultTemplate: async (req, res) => {
        const uid = req.uid;
        const default_template_group_id = req.params.group_id;
        const index = req.params.index;
        const templateIdx = await Template.postDefaultTemplateData(uid, default_template_group_id, index);

        if (templateIdx == -1) {
            return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.UPDATE_USERTEMPLATE_FAIL));
        }
        let update_time = Math.floor(Date.now() / 1000);
        // Success
        res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.WRITE_TEMPLATE_SUCCESS, [await Template.getUserTemplateByTemplateId(templateIdx)], update_time));

        await Template.postTemplateSyncFirebase(uid, update_time);
    },
    importOtherUsersTemplate: async (req, res) => {
        const uid = req.uid;
        const template_id = req.params.template_id;

        const templateIdx = await Template.postOtherUsersTemplateData(uid, template_id);

        if (templateIdx == -1) {
            return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.UPDATE_USERTEMPLATE_FAIL));
        }
        let update_time = Math.floor(Date.now() / 1000);

        // Success
        res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.WRITE_TEMPLATE_SUCCESS, [await Template.getUserTemplateByTemplateId(templateIdx)], update_time));

        await Template.postOtherUsersTemplateDataFirebase(uid, template_id);
        await Template.postTemplateSyncFirebase(uid, update_time);
    },
    updateUserTemplate: async (req, res) => {
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
        let update_time = Math.floor(Date.now() / 1000);
        // Success
        res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.UPDATE_USERTEMPLATE_SUCCESS, [await Template.getUserTemplateByTemplateId(template_id)], update_time));

        await Template.postTemplateSyncFirebase(uid, update_time);
    },
    deleteUserTemplate: async (req, res) => {
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
        let update_time = Math.floor(Date.now() / 1000);
        // Success
        res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.DELETE_USERTEMPLATE_SUCCESS, [{ template_id: Number(template_id) }], update_time));

        await Template.postTemplateSyncFirebase(uid, update_time);
    }
}