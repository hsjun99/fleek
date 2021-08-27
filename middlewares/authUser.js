const {Auth, getUid} = require("../modules/auth/firebaseAuth");
const statusCode = require("../modules/statusCode");
const util = require("../modules/util");
const resMessage = require("../modules/responseMessage");

const authUser = {
    checkToken: async(req, res, next) => {
        if (req.headers.authorization){
        var idToken = req.headers.authorization;
        if (!idToken){}
         //Invalid idToken
        if (!(await Auth(idToken))) {
            res.status(statusCode.UNAUTHORIZED).send(util.fail(statusCode.UNAUTHORIZED, resMessage.INVALID_TOKEN));
            return;
        }
        const uid = await getUid(idToken);
        req.uid = uid;
        } else{
        req.uid = 'sXwP7BZONrcS02SBy2HvTbu5ha43'
        }
        next();
    }
}

module.exports = authUser;