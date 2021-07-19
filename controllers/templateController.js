let util = require('../modules/util');
let statusCode = require('../modules/statusCode');
let resMessage = require('../modules/responseMessage');

var moment = require("moment");

let Template = require("../models/fleekTemplate");

const asyncForEach = require('../modules/function/asyncForEach');

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
    getTemplate: async(req, res) => {
        const uid = req.uid;
        await Template.getUserTemplate(uid);
    }
}