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
            const decodedToken = await admin.auth().verifyIdToken(idToken);
            return decodedToken.uid;
        } catch (error) {
            return false;
        }
    },
    Unregister: async (uid) => {
        try {
            await admin.auth().deleteUser(uid);
            return true;
        } catch (error) {
            return false;
        }
    }
}