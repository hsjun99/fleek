const {Auth, getUid} = require("../modules/auth/firebaseAuth");
const statusCode = require("../modules/statusCode");
const util = require("../modules/util");
const resMessage = require("../modules/responseMessage");

const authUser = {
    checkUid: async(req, res, next) => {
        req.uid = req.headers.uid;
        next();
    }
}

module.exports = authUser;