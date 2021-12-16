const pool = require('../modules/pool');
const asyncForEach = require('../modules/function/asyncForEach');

const table1 = 'userinfo';
const table2 = 'usergoal';
const table3 = 'follows';
const table4 = 'workoutAbility';
const table5 = 'suggestionBoard';
const table6 = 'userBodyInfoTracking';
const table7 = 'session';
const table8 = 'fcmToken';

var admin = require('firebase-admin');

const firebaseCM = require('../modules/firebase/firebaseCloudMessaging');

const getWorkoutEquation = require('../modules/functionFleek/getWorkoutEquation');

const ageGroupClassifier = require('../modules/classifier/ageGroupClassifier');
const weightGroupClassifier = require('../modules/classifier/weightGroupClassifier');
const experienceClassifier = require('../modules/classifier/experienceClassifier');

const wilksScoreCalculator = require('../modules/algorithm/wilksScoreCalculator');

const timeFunction = require('../modules/function/timeFunction');

const {Unregister} = require("../modules/auth/firebaseAuth");

const feedMessage = require('../modules/feedMessage');

const fleekUser = {
    unregister: async(uid) => {
        const query = `UPDATE ${table1} SET is_deleted = 1
                        WHERE uid="${uid}"`
        try {
            // Delete From Firebase
            const result = await Unregister(uid);

            await pool.queryParamMaster(query);
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
    /*
    updateLastConnectionTime: async(uid, last_connection_at) => {
        const query1 = `UPDATE ${table1} SET last_connection_at = "${last_connection_at}"
                        WHERE uid="${uid}"`;
        try {
            await pool.queryParamMaster(query1);
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
    */
    updateUserTimeZone: (uid, timezone) => {
        const query1 = `UPDATE ${table1} SET timezone = '${timezone}' WHERE uid = '${uid}'`;
        try {
            pool.queryParamMaster(query1);
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
    updatePrivacySetting: async(uid, privacyMode) => {
        const query1 = `UPDATE ${table1} SET privacy_setting = ${privacyMode}
                        WHERE uid="${uid}"`;
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
    addFcmToken: async(uid, fcm_token) => {
        const fields = 'token_value, userinfo_uid';
        const questions = `?, ?`;
        const values = [fcm_token, uid];
        const query = `INSERT IGNORE INTO ${table8}(${fields}) VALUES(${questions})`;
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
    getAllUser: async(uid) => {
        /*
        const field = `uid, name, MAX(${table7}.created_at) AS last_date`;
        // Privacy Setting: 전체공개(0), 나만보기(1)
        const query = `SELECT ${field} FROM ${table7}
                        RIGHT JOIN ${table1} ON ${table1}.uid = ${table7}.userinfo_uid
                        WHERE (${table1}.privacy_setting != 1 OR (${table1}.privacy_setting = 1 AND ${table1}.uid = '${uid}')) AND ${table1}.is_deleted != 1
                        GROUP BY ${table1}.uid
                        ORDER BY ${table1}.created_at`;
        */

        const field = `uid, name`;
        // Privacy Setting: 전체공개(0), 나만보기(1)
        const query = `SELECT ${field} FROM ${table1}
                        WHERE (${table1}.privacy_setting != 1 OR (${table1}.privacy_setting = 1 AND ${table1}.uid = '${uid}')) AND ${table1}.is_deleted != 1`;
        try {
            const result = await pool.queryParamSlave(query);
            return result;
        } catch (err){
            if (err.errno == 1062) {
                console.log('checkName ERROR: ', err.errno, err.code);
                return -1;
            }
            console.log("checkName ERROR: ", err);
            throw err;
        }
    },
    checkUser: async(uid) => {
        const field = 'uid';
        const query = `SELECT ${field} FROM ${table1} WHERE ${table1}.uid="${uid}" AND ${table1}.is_deleted != 1`;
        try {
            const result = await pool.queryParamSlave(query);
            if (result.length == 0) return false;
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
    getSetting: async(uid) => {
        const fields1 = 'is_kilogram, is_meter';
        const query1 = `SELECT ${fields1} FROM ${table1} WHERE ${table1}.uid="${uid}"`;
        try {
            const result1 = await pool.queryParamSlave(query1);
            return result1[0];
        } catch (err){
            if (err.errno == 1062) {
                console.log('checkName ERROR: ', err.errno, err.code);
                return -1;
            }
            console.log("checkName ERROR: ", err);
            throw err;
        }
    },
    updateSetting: async(uid, data) => {
        const query1 = `UPDATE ${table1} SET is_kilogram = ${data.is_kilogram}, is_meter = ${data.is_meter} WHERE uid="${uid}"`;
        try {
            await pool.queryParamMaster(query1);
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
    postData: async (uid, name, sex, age, height, weight, created_at, squat1RM, experience) => {
        const fields1 = 'uid, name, sex, age, height, weight, squat1RM, experience, percentage, created_at';
        // const fields2 = 'goal, userinfo_uid'
        const questions1 = `?, ?, ?, ?, ?, ?, ?, ?, ?, ?`;
        // const questions2 = `?, ?`
        const query1 = `INSERT INTO ${table1}(${fields1}) VALUES(${questions1})`;
        // const query2 = `INSERT INTO ${table2}(${fields2}) VALUES(${questions2})`;
        try {
            let percentage;
            if (squat1RM != null){
                const {inclination, intercept} = await getWorkoutEquation(200, sex, await ageGroupClassifier(age), await weightGroupClassifier(weight));
                percentage = Math.round(inclination * Math.log(squat1RM) + intercept);
                if (percentage < -100) percentage = -100;
            } else {
                percentage = await experienceClassifier(experience);
            }
            const values1 = [uid, name, sex, age, height, weight, squat1RM, experience, percentage, created_at];
            await pool.queryParamArrMaster(query1, values1);
            // const addGoals = async() => {
            //     await asyncForEach(goal, async(elem) => {
            //         await pool.queryParamArrMaster(query2, [elem, uid]);
            //     });
            // }
            // await addGoals();
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
            //onsole.log(uid, follow_uid)
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
    addFollowFirebase: async (uid, follow_uid, name, privacy_mode) => {
        const table_usersFeed = await admin.database().ref('usersFeed');
        try {
            // Send Message
            if (privacy_mode == 0){
                const message = await feedMessage.followed(uid);
                await table_usersFeed.child(follow_uid).update({new_message: 1});
                await table_usersFeed.child(follow_uid).push().set(message);
            }

            if (privacy_mode == 0){
                const fields2 = 'token_value';
                const query2 = `SELECT ${fields2} FROM ${table8}
                                WHERE ${table8}.userinfo_uid = '${follow_uid}'`;
                const result2 = await pool.queryParamSlave(query2);
                const token_list = await Promise.all(result2.map(async data => {
                    return data.token_value;
                }));
                const message_background = {
                    notification: {
                        title: '플릭(Fleek)',
                        body: `${name}님이 팔로우하였습니다! 확인해보세요!!`
                    }
                }
                const message_foreground = {
                    data: {
                        title: '플릭(Fleek)',
                        body: `${name}님이 팔로우하였습니다! 확인해보세요!!`
                    }
                }
                if (token_list.length != 0){
                    await firebaseCM(token_list, message_background, message_foreground);
                }
            }
            return true;
        } catch (err) {
            if (err.errno == 1062) {
                console.log('deleteSession ERROR: ', err.errno, err.code);
                return -1;
            }
            console.log("deleteSession ERROR: ", err);
            throw err;
        }
    },
    deleteFollow: async(uid, unfollow_uid) => {
        const query = `DELETE FROM ${table3} WHERE userinfo_uid = '${uid}' AND follow_uid = '${unfollow_uid}'`;
        try {
            const result = await pool.queryParamMaster(query);
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
        const query = `SELECT * FROM ${table3} WHERE userinfo_uid='${uid}' AND follow_uid='${follow_uid}'`;
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
    getFollowings: async (uid) => {
        const fields = "uid, name";
        const query = `SELECT ${fields} FROM ${table3}
                        INNER JOIN ${table1} ON ${table3}.follow_uid = ${table1}.uid AND ${table3}.userinfo_uid='${uid}' AND ${table1}.privacy_setting != 1
                        WHERE ${table1}.is_deleted != 1`;
        try {
            const result = await pool.queryParamMaster(query);
            return result;
        } catch (error) {
            if (err.errno == 1062) {
                console.log('getFollows ERROR: ', err.errno, err.code);
                return -1;
            }
            console.log("getFollows ERROR: ", err);
            throw err;
        }
    },
    getFollowers: async (uid) => {
        const fields = "uid, name";
        const query = `SELECT ${fields} FROM ${table3}
                        INNER JOIN ${table1} ON ${table3}.userinfo_uid = ${table1}.uid AND ${table3}.follow_uid = '${uid}' AND ${table1}.privacy_setting != 1
                        WHERE ${table1}.is_deleted != 1`;
        try {
            const result = await pool.queryParamSlave(query);
            return result;
        } catch (error) {
            if (err.errno == 1062) {
                console.log('getFollows ERROR: ', err.errno, err.code);
                return -1;
            }
            console.log("getFollows ERROR: ", err);
            throw err;
        }
    },
    getFollowersWithoutPrivacySetting: async (uid) => {
        const fields = "uid, name";
        const query = `SELECT ${fields} FROM ${table3}
                        INNER JOIN ${table1} ON ${table3}.userinfo_uid = ${table1}.uid AND ${table3}.follow_uid = '${uid}'
                        WHERE ${table1}.is_deleted != 1`;
        try {
            const result = await pool.queryParamSlave(query);
            return result;
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
        const query = `SELECT ${field} FROM ${table1} WHERE ${table1}.name="${name}" AND ${table1}.is_deleted != 1`;
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
        const fields1 = 'sex, age, height, weight, skeletal_muscle_mass, body_fat_ratio, percentage, name, privacy_setting';
        const fields2 = 'userBodyInfoTracking_id, height, weight, skeletal_muscle_mass, body_fat_ratio, created_at';
        const query1 = `SELECT ${fields1} FROM ${table1}
                        WHERE ${table1}.uid="${uid}"`;
        const query2 = `SELECT ${fields2} FROM ${table6}
                        WHERE ${table6}.userinfo_uid="${uid}"
                        ORDER BY created_at ASC`;

        try {
            const [result, body_info_history] = await Promise.all([await pool.queryParamMaster(query1), await pool.queryParamMaster(query2)]) ;
            const sex = result[0].sex;
            const age = result[0].age;
            let height = result[0].height;
            let weight = result[0].weight;
            const skeletal_muscle_mass = result[0].skeletal_muscle_mass;
            const body_fat_ratio = result[0].body_fat_ratio;
            const percentage = result[0].percentage;
            const name = result[0].name;
            const privacy_setting = result[0].privacy_setting;
            if (!(body_info_history.length == 0)){
                height = body_info_history[body_info_history.length-1].height;
                weight = body_info_history[body_info_history.length-1].weight;
            } 

            return {sex, age, height, weight, skeletal_muscle_mass, body_fat_ratio, percentage, name, privacy_setting, body_info_history};
        } catch (err) {
            if (err.errno == 1062) {
                console.log('getProfile ERROR: ', err.errno, err.code);
                return -1;
            }
            console.log("getProfile ERROR: ", err);
            throw err;
        }
    },
    getAchievement: async (uid, sex, weight) => {
        const fields1 = 'workout_workout_id, MAX(max_one_rm) AS max_one_rm';
        const query1 = `SELECT ${fields1} FROM ${table4}
                        INNER JOIN ${table7} ON ${table7}.session_id = ${table4}.session_session_id AND ${table7}.is_deleted != 1
                        WHERE ${table4}.userinfo_uid="${uid}" AND ${table4}.workout_workout_id IN (29, 30, 200, 79, 81, 83)
                        GROUP BY ${table4}.workout_workout_id`;

        try {
            const result1 = await pool.queryParamArrSlave(query1);
            let benchpress_list=[], squat_list=[], deadlift_list=[];
            await Promise.all(result1.map(async(rowdata) => {
                if (rowdata.workout_workout_id == 29 || rowdata.workout_workout_id == 30) {
                    benchpress_list.push(rowdata);
                } else if (rowdata.workout_workout_id == 200 || rowdata.workout_workout_id == 3101) {
                    squat_list.push(rowdata);
                } else {
                    deadlift_list.push(rowdata);
                }
            }));
            let wilks_score=null;
            if (!(benchpress_list.length == 0 || squat_list.length == 0 || deadlift_list.length == 0)) {
                const [benchpress_one_rm, squat_one_rm, deadlift_one_rm] = await Promise.all([
                    (await benchpress_list.reduce(async(prev, current) => (prev.max_one_rm > current.max_one_rm) ? prev : current)).max_one_rm,
                    squat_list[0].max_one_rm,
                    (await deadlift_list.reduce(async(prev, current) => (prev.max_one_rm > current.max_one_rm) ? prev : current)).max_one_rm,
                ]);
                wilks_score = await wilksScoreCalculator(benchpress_one_rm+squat_one_rm+deadlift_one_rm, sex, weight);
            }
            return {
                wilks_score: wilks_score
            }
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
            await pool.queryParamMaster(query1);
            await pool.queryParamArrMaster(query2, values2);
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
    updateBodyInfoRecord: async(uid, userBodyInfoTracking_id, height, weight, skeletal_muscle_mass, body_fat_ratio) => {
        const query = `UPDATE ${table6} SET height = ${height}, weight = ${weight}, skeletal_muscle_mass = ${skeletal_muscle_mass}, body_fat_ratio = ${body_fat_ratio}
                        WHERE userinfo_uid="${uid}" AND userBodyInfoTracking_id = ${userBodyInfoTracking_id}`;
        try {
            await pool.queryParamMaster(query);
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
    updateBodyInfo: async(uid, height, weight, skeletal_muscle_mass, body_fat_ratio) => {
        const fields2 = 'height, weight, skeletal_muscle_mass, body_fat_ratio, userinfo_uid, created_at';
        const questions2 = `?, ?, ?, ?, ?, ?`;
        const values2 = [height, weight, skeletal_muscle_mass, body_fat_ratio, uid, await timeFunction.currentTime()];
        const query1 = `UPDATE ${table1} SET height="${height}", weight="${weight}", skeletal_muscle_mass = ${skeletal_muscle_mass}, body_fat_ratio = ${body_fat_ratio} WHERE uid="${uid}"`;
        const query2 = `INSERT INTO ${table6}(${fields2}) VALUES(${questions2})`;
        try {
            await pool.queryParamMaster(query1);
            await pool.queryParamArrMaster(query2, values2);
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
    deleteBodyInfo: async(uid, userBodyInfoTracking_id) => {
        const query1 = `DELETE FROM ${table6} WHERE ${table6}.userinfo_uid = '${uid}' AND ${table6}.userBodyInfoTracking_id = ${userBodyInfoTracking_id}`;
        try {
            await pool.queryParamMaster(query1);
            return true;
        } catch (err) {
            if (err.errno == 1062) {
                console.log('updateProfile ERROR: ', err.errno, err.code);
                return -1;
            }
            console.log("updateProfile ERROR: ", err);
            throw err;
        }
    }
    ,
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
            return result;
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