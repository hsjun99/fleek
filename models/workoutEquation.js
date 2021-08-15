const pool = require('../modules/pool');

const table = 'equation';

const workoutEquation = {
    getEquation: async (workout_id, sex, age, weight) => {
        const fields = 'inclination, intercept';
        const query = `SELECT ${fields} FROM ${table} WHERE workout_workout_id="${workout_id}" AND sex="${sex}" AND age="${age}" AND weight="${weight}"`;
        try {
            const result = await pool.queryParamSlave(query);
            let inclination, intercept;
            if (result.length == 0) {
                inclination = null;
                intercept = null;
            } else {
                inclination = result[0].inclination;
                intercept = result[0].intercept;
            }
            return {inclination, intercept};
        } catch (err) {
            if (err.errno == 1062) {
                console.log('getEquation ERROR: ', err.errno, err.code);
                return -1;
            }
            console.log("getEquation ERROR: ", err);
            throw err;
        }
    },
    checkEquation: async (workout_id, sex, age, weight) => {
        const query = `SELECT * FROM ${table} WHERE workout_workout_id="${workout_id}" AND sex="${sex}" AND age="${age}" AND weight="${weight}"`;
        try {
            const result = await pool.queryParamSlave(query);
            console.log(result);
            if (result.length === 0) {
                return false;
            } else return true
        } catch (error) {
            if (err.errno == 1062) {
                console.log('checkEquation Error : ', err.errno, err.code);
                return -1;
            }
            console.log('checkEquation Error : ', err);
            throw err;
        }
    }
}

module.exports = workoutEquation;