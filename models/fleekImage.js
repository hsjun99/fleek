const pool = require('../modules/pool');
const asyncForEach = require('../modules/function/asyncForEach');
const timeFunction = require('../modules/function/timeFunction');

const table_userinfo = 'userinfo';


const fleekImage = {
    updateProfileUrl: async (uid, profile_url) => {
        const query = `UPDATE ${table_userinfo}
                        SET profile_url = '${profile_url}'
                        WHERE uid = '${uid}'`;
        try {
            await pool.queryParamMaster(query);
            return true;
        } catch (err) {
            if (err.errno == 1062) {
                console.log('getWorkoutMaxOneRm ERROR: ', err.errno, err.code);
                return -1;
            }
            console.log("getWorkoutMaxOneRm ERROR: ", err);
            throw err;
        }
    },
    deleteProfileUrl: async (uid) => {
        const query = `UPDATE ${table_userinfo}
                        SET profile_url = NULL
                        WHERE uid = '${uid}'`;
        try {
            await pool.queryParamMaster(query);
            return true;
        } catch (err) {
            if (err.errno == 1062) {
                console.log('getWorkoutMaxOneRm ERROR: ', err.errno, err.code);
                return -1;
            }
            console.log("getWorkoutMaxOneRm ERROR: ", err);
            throw err;
        }
    },
}

module.exports = fleekImage;