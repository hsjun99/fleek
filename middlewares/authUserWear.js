const { Auth, getUid } = require("../modules/auth/firebaseAuth");
const statusCode = require("../modules/statusCode");
const util = require("../modules/util");
const resMessage = require("../modules/responseMessage");

const authUser = {
    checkUid: async (req, res, next) => {
        req.uid = req.headers.uid;
        if (req.headers.lang_code == null || req.headers.lang_code == undefined) {
            req.lang_code = 1; // Korean Default
        } else {
            req.lang_code = req.headers.lang_code;
        }
        next();
    }
}

module.exports = authUser;