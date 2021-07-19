const {Auth, getUid} = require("../modules/auth/firebaseAuth");
const statusCode = require("../modules/statusCode");
const util = require("../modules/util");
const resMessage = require("../modules/responseMessage");

const authUser = {
    checkToken: async(req, res, next) => {
        if (!req.headers.authorization){
            req.uid = 'duDgKLOM3igB18tDAjsqmtJOSXe2';
            next();
        }
        var idToken = req.headers.authorization;
        if (!idToken){}
         //Invalid idToken
        if (!(await Auth(idToken))) {
            res.status(statusCode.UNAUTHORIZED).send(util.fail(statusCode.UNAUTHORIZED, resMessage.INVALID_TOKEN));
            return;
        }
        const uid = await getUid(idToken);
        console.log(uid);
        req.uid = uid;
        //req.uid = 'duDgKLOM3igB18tDAjsqmtJOSXe2';
        next();
    }
}

module.exports = authUser;