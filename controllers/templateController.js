let util = require('../modules/util');
let statusCode = require('../modules/statusCode');
let resMessage = require('../modules/responseMessage');

let Template = require("../models/fleekTemplate");

module.exports = {
    savetemplate: async (req, res) => {
        const uid = req.uid;
        const data = req.body;
        const templateIdx = await Template.postTemplateData(uid, data.name, data.detail);
        if (templateIdx == -1) {
            return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.DB_ERROR));
        }
        res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.WRITE_SESSION_SUCCESS, {templateIdx: templateIdx}));
    },
    getUserTemplate: async(req, res) => {
        const uid = req.uid;
        const templateData = await Template.getUserTemplate(uid);
        if (templateData == -1) {
            return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.DB_ERROR));
        }
        res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.WRITE_SESSION_SUCCESS, templateData));
    },
    getDefaultTemplate: async(req, res) => {
        const templateData = await Template.getDefaultTemplate();
        if (templateData == -1) {
            return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.DB_ERROR));
        }
        res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.WRITE_SESSION_SUCCESS, templateData));
    },
    updateUserTemplate: async(req, res) => {
        const uid = req.uid;
        const template_id = req.params.template_id;
        const data = req.body;
        const flag = await Template.checkTemplate(uid, template_id);
        if (flag == -1) {
            return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.DB_ERROR));
        }
        if (flag == false) {
            return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, resMessage.INVALID_USER));
        }
        const result = await Template.updateUserTemplate(uid, template_id, data.name, data.detail);
        if (result == -1) {
            return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.DB_ERROR));
        }
        res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.WRITE_SESSION_SUCCESS, {updated_template_id: template_id}));
    },
    deleteUserTemplate: async(req, res) => {
        const uid = req.uid;
        const template_id = req.params.template_id;
        const flag = await Template.checkTemplate(uid, template_id);
        if (flag == -1) {
            return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.DB_ERROR));
        }
        if (flag == false) {
            return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, resMessage.INVALID_USER));
        }
        const result = await Template.deleteUserTemplate(uid, template_id);
        if (result == -1) {
            return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.DB_ERROR));
        }
        res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.WRITE_SESSION_SUCCESS, {deleted_template_id: template_id}));
    }
}