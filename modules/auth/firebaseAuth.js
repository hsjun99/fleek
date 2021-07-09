var admin = require('firebase-admin');

module.exports = {
    //Authorization
    Auth: async (idToken) => {
        try {
            await admin.auth().verifyIdToken(idToken);
            return true;
        } catch (error) {
            return false;
        }
    },
    //Get UID
    getUid: async (idToken) => {
        try {
            await admin.auth().verifyIdToken(idToken);
            return true;
        } catch (error) {
            return false;
        }
    }
}