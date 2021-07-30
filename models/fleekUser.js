const pool = require('../modules/pool');
const asyncForEach = require('../modules/function/asyncForEach');
const table1 = 'userinfo';
const table2 = 'usergoal';
const table3 = 'follows';
const table4 = 'workoutAbility';
const table5 = 'suggestionBoard';
const table6 = 'userBodyInfoTracking';

const workoutEquation = require('./workoutEquation');

const ageGroupClassifier = require('../modules/classifier/ageGroupClassifier');
const weightGroupClassifier = require('../modules/classifier/weightGroupClassifier');
const experienceClassifier = require('../modules/classifier/experienceClassifier');

const timeFunction = require('../modules/function/timeFunction');

const fleekUser = {
    postData: async (uid, name, sex, age, height, weight, created_at, squat1RM, experience, goal) => {
        const fields1 = 'uid, name, sex, age, height, weight, squat1RM, experience, percentage, created_at';
        const fields2 = 'goal, userinfo_uid'
        const questions1 = `?, ?, ?, ?, ?, ?, ?, ?, ?, ?`;
        const questions2 = `?, ?`
        const query1 = `INSERT INTO ${table1}(${fields1}) VALUES(${questions1})`;
        const query2 = `INSERT INTO ${table2}(${fields2}) VALUES(${questions2})`;
        try {
            let percentage;
            if (squat1RM != null){
                const {inclination, intercept} = await workoutEquation.getEquation(200, sex, await ageGroupClassifier(age), await weightGroupClassifier(weight));
                percentage = Math.round(inclination * Math.log(squat1RM) + intercept);
                if (percentage < -100) percentage = -100;
            } else {
                percentage = await experienceClassifier(experience);
            }
            const values1 = [uid, name, sex, age, height, weight, squat1RM, experience, percentage, created_at];
            const result = await pool.queryParamArrMaster(query1, values1);
            const addGoals = async() => {
                await asyncForEach(goal, async(elem) => {
                    await pool.queryParamArrMaster(query2, [elem, uid]);
                });
            }
            await addGoals();
            return uid;
        } catch (err) {
            if (err.errno == 1062) {
                console.log('postData ERROR : ', err.errno, err.code);
                return -1;
            }
            console.log('postData ERROR : ', err);
            throw err;
        }
    },
    nameToUid: async (name) => {
        const field = 'uid';
        const query = `SELECT ${field} FROM ${table1} WHERE ${table1}.name="${name}"`;
        try {
            const result = await pool.queryParamSlave(query);
            if (result.length == 0) return false;
            return result[0];
        } catch (error) {
            if (err.errno == 1062) {
                console.log('nameToUid ERROR: ', err.errno, err.code);
                return -1;
            }
            console.log("nameToUid ERROR: ", err);
            throw err;
        }
    },
    addFollow: async (uid, follow_uid) => {
        const fields = 'userinfo_uid, follow_uid';
        const questions = `?, ?`;
        const values = [uid, follow_uid];
        const query = `INSERT INTO ${table3}(${fields}) VALUES(${questions})`;
        try {
            const result = await pool.queryParamArrMaster(query, values);
            return result[0];
        } catch (err) {
            if (err.errno == 1062) {
                console.log('addFollow ERROR : ', err.errno, err.code);
                return -1;
            }
            console.log('addFollow ERROR : ', err);
            throw err;
        }
    },
    checkFollow: async (uid, follow_uid) => {
        const fields = 'follows_id'
        const query = `SELECT ${fields} FROM ${table3} WHERE userinfo_uid='${uid}' AND follow_uid='${follow_uid}'`;
        try {
            const result = await pool.queryParamSlave(query);
            if (result.length == 0) return false; // Not Following
            return true; // Following
        } catch (error) {
            if (err.errno == 1062) {
                console.log('checkFollow ERROR: ', err.errno, err.code);
                return -1;
            }
            console.log("checkFollow ERROR: ", err);
            throw err;
        }
    },
    getFollows: async (uid) => {
        const fields = "name";
        const query = `SELECT ${fields} FROM ${table3}
                        INNER JOIN ${table1} ON ${table3}.follow_uid = ${table1}.uid AND ${table3}.userinfo_uid='${uid}'`;
        try {
            const result = await pool.queryParamSlave(query);
            const restructure = async() => {
                let data = [];
                await asyncForEach(result, async(rowdata) => {
                    data.push(rowdata.name);
                });
                return data;
            }
            const data = await restructure();
            return data;
        } catch (error) {
            if (err.errno == 1062) {
                console.log('getFollows ERROR: ', err.errno, err.code);
                return -1;
            }
            console.log("getFollows ERROR: ", err);
            throw err;
        }
    },
    checkName: async (name) => {
        const field = 'name';
        const query = `SELECT ${field} FROM ${table1} WHERE ${table1}.name="${name}"`;
        try {
            const result = await pool.queryParamSlave(query);
            if (result.length != 0) return false;
            return true;
        } catch (err){
            if (err.errno == 1062) {
                console.log('checkName ERROR: ', err.errno, err.code);
                return -1;
            }
            console.log("checkName ERROR: ", err);
            throw err;
        }
    },
    getProfile: async (uid) => {
        const fields = 'sex, age, height, weight, percentage, name';
        const query = `SELECT ${fields} FROM ${table1} 
                        WHERE ${table1}.uid="${uid}"`;
        try {
            const result = await pool.queryParamSlave(query);
            const sex = result[0].sex;
            const age = result[0].age;
            const height = result[0].height;
            const weight = result[0].weight;
            const percentage = result[0].percentage;
            const name = result[0].name;
            return {sex, age, height, weight, percentage, name};
        } catch (err) {
            if (err.errno == 1062) {
                console.log('getProfile ERROR: ', err.errno, err.code);
                return -1;
            }
            console.log("getProfile ERROR: ", err);
            throw err;
        }
    },
    updateProfile: async (uid, name, sex, age, height, weight, goal) => {
        const query1 = `UPDATE ${table1} SET name="${name}", sex="${sex}", age="${age}", height="${height}", weight="${weight}" WHERE uid="${uid}"`;
        try {
            const result1 = await pool.queryParamMaster(query1);
            return true;
        } catch (err) {
            if (err.errno == 1062) {
                console.log('updateProfile ERROR: ', err.errno, err.code);
                return -1;
            }
            console.log("updateProfile ERROR: ", err);
            throw err;
        }
    },
    updateName: async(uid, modifiedName) => {
        const query1 = `UPDATE ${table1} SET name="${modifiedName}" WHERE uid="${uid}"`;
        try {
            const result1 = await pool.queryParamMaster(query1);
            return true;
        } catch (err) {
            if (err.errno == 1062) {
                console.log('updateProfile ERROR: ', err.errno, err.code);
                return -1;
            }
            console.log("updateProfile ERROR: ", err);
            throw err;
        }
    },
    updateHeightWeight: async(uid, height, weight) => {
        const fields2 = 'height, weight, userinfo_uid, created_at';
        const questions2 = `?, ?, ?, ?`;
        const values2 = [height, weight, uid, await timeFunction.currentTime()];
        const query1 = `UPDATE ${table1} SET height="${height}", weight="${weight}" WHERE uid="${uid}"`;
        const query2 = `INSERT INTO ${table6}(${fields2}) VALUES(${questions2})`;
        try {
            const result1 = await pool.queryParamMaster(query1);
            const result2 = await pool.queryParamArrMaster(query2, values2);
            return true;
        } catch (err) {
            if (err.errno == 1062) {
                console.log('updateProfile ERROR: ', err.errno, err.code);
                return -1;
            }
            console.log("updateProfile ERROR: ", err);
            throw err;
        }
    },
    getWorkoutMaxOneRm: async(uid, workout_id) => {
        const fields = 'max_one_rm';
        const query = `SELECT ${fields} FROM ${table4} 
                        WHERE ${table4}.userinfo_uid="${uid}" AND ${table4}.workout_workout_id="${workout_id}"
                        ORDER BY workoutAbility_id DESC
                        LIMIT 1`;
        try {
            const result = await pool.queryParamSlave(query);
            let max_one_rm = 0;
            if (result.length > 0) max_one_rm = result[0].max_one_rm;
            return max_one_rm;
        } catch (err) {
            if (err.errno == 1062) {
                console.log('getWorkoutMaxOneRm ERROR: ', err.errno, err.code);
                return -1;
            }
            console.log("getWorkoutMaxOneRm ERROR: ", err);
            throw err;
        }
    },
    postSuggestion: async(uid, content) => {
        const fields = 'content, userinfo_uid';
        const questions = `?, ?`;
        const values = [content, uid];
        const query = `INSERT INTO ${table5}(${fields}) VALUES(${questions})`;
        try {
            const result = await pool.queryParamArrMaster(query, values);
            return result[0];
        } catch (err) {
            if (err.errno == 1062) {
                console.log('addFollow ERROR : ', err.errno, err.code);
                return -1;
            }
            console.log('addFollow ERROR : ', err);
            throw err;
        }
    }
}

module.exports = fleekUser;