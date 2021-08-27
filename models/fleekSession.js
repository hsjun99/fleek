const pool = require('../modules/pool');
const asyncForEach = require('../modules/function/asyncForEach');

const oneRmCalculator = require('../modules/algorithm/oneRmCalculator');
//const alphaProgram = require('../modules/algorithm/alphaProgram');

const ageGroupClassifier = require('../modules/classifier/ageGroupClassifier');
const weightGroupClassifier = require('../modules/classifier/weightGroupClassifier');

const table_workout = 'workout';
const table_workoutlog = 'workoutlog';
const table_session = 'session';
const table_templateUsers = 'templateUsers';
const table_workoutAbility = 'workoutAbility';
const table_userWorkoutHistory = 'userWorkoutHistory';
const table_alphaProgramUsers = 'alphaProgramUsers';
const table_alphaProgram = 'alphaProgram';
const table_userinfo = 'userinfo';
const table_fcmToken = 'fcmToken';


const WorkoutAbility = require('./fleekWorkoutAbility');
const WorkoutEquation = require('./workoutEquation');
const User = require('./fleekUser');

var admin = require('firebase-admin');

const firebaseCM = require('../modules/firebase/firebaseCloudMessaging');

const session = {
    sessionLike: async(uid, session_id, emoji_type) => {
        const table_sessionLike = await admin.database().ref('sessionLike');

        const fields1 = 'userinfo_uid'
        const query1 = `SELECT ${fields1} FROM ${table_session}
                        WHERE ${table_session}.session_id = ${session_id}`;
        try {
            if (await (await admin.database().ref('sessionLike').child(session_id).once('value')).val() == null) {
                await table_sessionLike.update({[session_id]: {0: {cnt:0, users:['null']}, 1: {cnt:0, users:['null']}, 2: {cnt:0, users:['null']}, 3: {cnt:0, users:['null']}, 4: {cnt:0, users:['null']}}});
                const userList = await (await table_sessionLike.child(session_id).child(emoji_type).child('users').once('value')).val();
                userList.push(uid);
                await table_sessionLike.child(session_id).child(emoji_type).update({
                    cnt: admin.database.ServerValue.increment(1),
                    users: userList
                });
            } else {
                // Step1: Remove user's emoji from the database
                await Promise.all([0, 1, 2, 3, 4].map(async(emoji_type) => {
                    const userList = await(await table_sessionLike.child(session_id).child(emoji_type).child('users').once('value')).val();
                    var index = userList.indexOf(uid);
                    if (index > -1) {
                        userList.splice(index, 1);
                        await table_sessionLike.child(session_id).child(emoji_type).update({
                            cnt: admin.database.ServerValue.increment(-1),
                            users: userList
                        })
                    }
                }));
                // Step2: Add user's new emoji to the database
                const userList = await (await table_sessionLike.child(session_id).child(emoji_type).child('users').once('value')).val();
                if (!userList.includes(uid)){
                    userList.push(uid);
                    await table_sessionLike.child(session_id).child(emoji_type).update({
                        cnt: admin.database.ServerValue.increment(1),
                        users: userList
                    })
                }
            }
            const result1 = await pool.queryParamSlave(query1);
            const liked_uid = result1.userinfo_uid;

            const fields2 = 'token_value';
            const query2 = `SELECT ${fields2} FROM ${table_fcmToken}
                            WHERE ${table_fcmToken}.userinfo_uid = '${liked_uid}'`;
            const result2 = await pool.queryParamSlave(query2);
            const token_list = await Promise.all(result2.map(async data => {
                return data.token_value;
            }));
            const message = {
                notification: {
                  title: '플릭(Fleek)',
                  body: `좋아요를 받았습니다! 확인해보세요!!`
                }
            }
            if (token_list.length != 0){
                await firebaseCM(token_list, message)
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
    sessionStart: async(uid, name, followers_list) => {
        const table_usersOnline = await admin.database().ref('usersOnline');
        try {
            table_usersOnline.update({[uid]: 1});
            /*
            const followersString = '(' + followers_list.toString(',') + ')';
            const fields1 = 'token_value';
            const query1 = `SELECT ${fields1} FROM ${table_fcmToken}
                            WHERE ${table_fcmToken}.userinfo_uid IN ${followersString}`;
            const result1 = await pool.queryParamSlave(query1);
            const token_list = await Promise.all(result1.map(async data => {
                return data.token_value;
            }));
            const message = {
                notification: {
                  title: '플릭(Fleek)',
                  body: `${name}님이 운동을 시작하셨습니다!`
                }
              }
            await firebaseCM(token_list, message);
*/
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
    sessionStop: async(uid, name, followers_list) => {
        const table_usersOnline = await admin.database().ref('usersOnline');
        try {
            table_usersOnline.update({[uid]: 0});
            /*
            const followersString = '(' + followers_list.toString(',') + ')';
            const fields1 = 'token_value';
            const query1 = `SELECT ${fields1} FROM ${table_fcmToken}
                            WHERE ${table_fcmToken}.userinfo_uid IN ${followersString}`;
            const result1 = await pool.queryParamSlave(query1);
            const token_list = await Promise.all(result1.map(async data => {
                return data.token_value;
            }));
            const message = {
                notification: {
                  title: '플릭(Fleek)',
                  body: `${name}님이 운동을 시작하셨습니다!`
                }
              }
            await firebaseCM(token_list, message);
*/
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
    sessionFinish: async(uid, name, followers_list, session_id) => {
        const table_usersOnline = await admin.database().ref('usersOnline');
        const table_sessionLike = await admin.database().ref('sessionLike');
        try {
            table_usersOnline.update({[uid]: 0});
            table_sessionLike.update({[session_id]: {0: {cnt:0, users:['null']}, 1: {cnt:0, users:['null']}, 2: {cnt:0, users:['null']}, 3: {cnt:0, users:['null']}, 4: {cnt:0, users:['null']}}});
            /*
            List<EmojiType> emojiList = [
                EmojiType(0, "정말 대단해요", "👍"),
                EmojiType(1, "너무 뜨거워요", "🔥"),
                EmojiType(2, "헬창이세요?", "💪"),
                EmojiType(3, "루틴 좋아요", "❤️"),
                EmojiType(4, "와우", "😳"),
            ];
            */
            const followersString = '(' + followers_list.toString(',') + ')';
            const fields1 = 'token_value';
            const query1 = `SELECT ${fields1} FROM ${table_fcmToken}
                            WHERE ${table_fcmToken}.userinfo_uid IN ${followersString}`;
            const result1 = await pool.queryParamSlave(query1);
            /*
            const token_list = await Promise.all(result1.map(async data => {
                return data.token_value;
            }));
            const message = {
                notification: {
                  title: '플릭(Fleek)',
                  body: `${name}님이 운동을 완료했습니다!!!가야돼가야돼~~`
                }
            }
            await firebaseCM(token_list, message);
            */
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
    postSessionData: async (uid, data, created_at, template_id, total_time, alphaProgramUsers_id, alphaProgram_progress) => {
        const fields1 = 'userinfo_uid, created_at, templateUsers_template_id, alphaProgramUsers_alphaProgramUsers_id, alphaProgramUsers_progress, total_time';
        const fields2 = 'reps, weight, duration, distance, iswarmup, workout_order, set_order, rest_time, workout_workout_id, session_session_id';
        const fields4 = 'max_one_rm, total_volume, max_volume, total_reps, max_weight, workout_workout_id, userinfo_uid, session_session_id, created_at';
        const questions1 = '?, ?, ?, ?, ?, ?';
        const questions2 = '?, ?, ?, ?, ?, ?, ?, ?, ?, ?';
        const questions4 = '?, ?, ?, ?, ?, ?, ?, ?, ?';
        const values1 = [uid, created_at, template_id, alphaProgramUsers_id, alphaProgram_progress, total_time];
        // Insert into Session Table
        const query1 = `INSERT INTO ${table_session}(${fields1}) VALUES(${questions1})`;
        // Insert into Workoutlog Table
        const query2 = `INSERT INTO ${table_workoutlog}(${fields2}) VALUES(${questions2})`;
        // Update Template Table - lastdate
        const query3 = `UPDATE ${table_templateUsers} SET lastdate='${created_at}'
                        WHERE ${table_templateUsers}.templateUsers_id = ${template_id}`;
        // Insert into WorkoutAbility Table
        const query4 = `INSERT INTO ${table_workoutAbility}(${fields4}) VALUES(${questions4})`;
        // Update AlphaProgramUsers Table - progress
        const query7 = `UPDATE ${table_alphaProgramUsers} SET progress=${alphaProgram_progress}+1
                        WHERE ${table_alphaProgramUsers}.userinfo_uid = '${uid}' AND ${table_alphaProgramUsers}.alphaProgramUsers_id = ${alphaProgramUsers_id} AND ${table_alphaProgramUsers}.is_done = 0`;
        try {
            const result1 = await pool.queryParamArrMaster(query1, values1);
            const session_id = result1.insertId;
            
            let session_total_volume=0, session_total_sets=0, session_total_reps=0;
            let one_rms_index = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                                 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                                 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                                 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            const addWorkoutlog = async() => {
                await asyncForEach(data, async(workouts) => {
                    let max_one_rm=0, total_volume=0, max_volume=0, total_reps=0, max_weight=0;
                    // Get Multiplier from Workout Table
                    const query9 = `SELECT multiplier FROM ${table_workout}
                                        WHERE ${table_workout}.workout_id = ${workouts.workout_id}`;
                    const result9 = await pool.queryParamArrSlave(query9);
                    await asyncForEach(workouts.detail, async(sets) => {
                        await pool.queryParamArrMaster(query2, [sets.reps, sets.weight, sets.duration, sets.distance, sets.iswarmup, workouts.workout_order, sets.set_order, workouts.rest_time, workouts.workout_id, result1.insertId]);
                        max_one_rm = Math.max(max_one_rm, await oneRmCalculator(sets.weight, sets.reps));
                        total_volume += sets.reps * sets.weight * result9[0].multiplier;
                        max_volume = Math.max(max_volume, sets.reps * sets.weight * result9[0].multiplier);
                        total_reps += sets.reps;
                        max_weight = Math.max(max_weight, sets.weight);
                    })
                    await pool.queryParamArrMaster(query4, [max_one_rm, total_volume, max_volume, total_reps, max_weight, workouts.workout_id, uid, result1.insertId, created_at]);
                    // Update UserWorkoutHistory Table - finish_num
                    const query5 = `UPDATE ${table_userWorkoutHistory} SET finish_num = finish_num+1 WHERE userinfo_uid = "${uid}" AND workout_workout_id="${workouts.workout_id}"`;
                    await pool.queryParamMaster(query5)
                    session_total_volume += total_volume;
                    session_total_sets += workouts.detail.length;
                    session_total_reps += total_reps;
                    one_rms_index[workouts.workouts_index-1] = max_one_rm.toFixed(2);
                });
            }
            await addWorkoutlog();
            await pool.queryParamMaster(query3);
            await pool.queryParamMaster(query7);

            const fields6 = 'total_volume, total_sets, total_reps';
            // Update Session Table - total volume, sets, reps
            const query6 = `UPDATE ${table_session} SET session_total_volume = ${session_total_volume}, session_total_sets = ${session_total_sets}, session_total_reps = ${session_total_reps}
                            WHERE ${table_session}.session_id = ${result1.insertId}`;
            await pool.queryParamMaster(query6);

            const fields10 = 'workouts_index, total_days';
            const query10 = `SELECT ${fields10} FROM ${table_alphaProgramUsers}
                            INNER JOIN ${table_alphaProgram} ON ${table_alphaProgram}.alphaProgram_id = ${table_alphaProgramUsers}.alphaProgram_alphaProgram_id AND ${table_alphaProgramUsers}.alphaProgramUsers_id = ${alphaProgramUsers_id}`;
            const result10 = await pool.queryParamSlave(query10);
            if (alphaProgramUsers_id != null && alphaProgram_progress == 0) {
                const workouts_index = JSON.parse(result10[0].workouts_index).workouts_index;
                await Promise.all(one_rms_index.map(async (elem, index) => {
                    if (workouts_index[index] != 0 && Math.round(elem) == 0) {
                        let oneRmPastData = await WorkoutAbility.getWorkoutMaxOneRm(uid, workouts_index[index]);
                        if (Math.round(oneRmPastData) == 0) {
                            const {sex, age, weight, percentage} = await User.getProfile(uid);
                            const ageGroup = await ageGroupClassifier(age);
                            const weightGroup = await weightGroupClassifier(weight);
                            const {inclination, intercept} = await WorkoutEquation.getEquation(workouts_index[index], sex, ageGroup, weightGroup);
                            oneRmPastData = Math.exp((percentage-intercept)/inclination);
                        }
                        one_rms_index[index] = oneRmPastData.toFixed(2);
                    }
                }))
                const one_rms_index_String = JSON.stringify({one_rms_index: one_rms_index});
                // Update AlphaProgramUsers Table - one_rms_by_tier
                const query8 = `UPDATE ${table_alphaProgramUsers} SET one_rms_index='${one_rms_index_String}'
                                WHERE ${table_alphaProgramUsers}.userinfo_uid = '${uid}' AND ${table_alphaProgramUsers}.alphaProgramUsers_id = ${alphaProgramUsers_id} AND ${table_alphaProgramUsers}.is_done = 0`;
                await pool.queryParamMaster(query8);
            } else if (alphaProgramUsers_id != null && alphaProgram_progress > 0) {
                if (result10[0].total_days == alphaProgram_progress) {
                    const query8 = `UPDATE ${table_alphaProgramUsers} SET is_done = 1
                                    WHERE ${table_alphaProgramUsers}.userinfo_uid = '${uid}' AND ${table_alphaProgramUsers}.alphaProgramUsers_id = ${alphaProgramUsers_id} AND ${table_alphaProgramUsers}.is_done = 0`;
                    await pool.queryParamMaster(query8);
                }
            }
            return session_id;
        } catch (err) {
            if (err.errno == 1062) {
                console.log('postSessionData ERROR: ', err.errno, err.code);
                return -1;
            }
            console.log("postSessionData ERROR: ", err);
            throw err;
        }
    },
    deleteSession: async(uid, session_id) => {
        const fields0 = 'workout_workout_id';
        const query0 = `SELECT DISTINCT ${fields0} FROM ${table_workoutlog}
                        WHERE ${table_workoutlog}.session_session_id = ${session_id}`;
        const query = `UPDATE ${table_session} SET is_deleted=1
                        WHERE ${table_session}.session_id = ${session_id} AND ${table_session}.userinfo_uid = "${uid}"`;
        

        
        // Transactions
        let transactionArr = new Array();

        let workoutsString;

        const ts1 = async (connection) => {
            const result0 = await pool.queryParamArrSlave(query0);
            let data = [];
            await asyncForEach(result0, async(rowdata) => {
                data.push(rowdata.workout_workout_id);
            });
            workoutsString = '(' + data.toString(',') + ')';
            connection.query(query);
        }
        const ts2 = async (connection) => {
            const query1 = `UPDATE ${table_userWorkoutHistory} SET finish_num = finish_num - 1
                            WHERE ${table_userWorkoutHistory}.userinfo_uid = '${uid}' AND ${table_userWorkoutHistory}.workout_workout_id IN ${workoutsString}`;
            await connection.query(query1);
        }
        try {
            transactionArr.push(ts1);
            transactionArr.push(ts2);
            await pool.Transaction(transactionArr);
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
    getAllSessionData: async () => {
        const fields = `${table_session}.userinfo_uid, ${table_userinfo}.name, ${table_templateUsers}.name AS template_name, ${table_workoutlog}.reps, ${table_workoutlog}.weight, ${table_workoutlog}.duration, ${table_workoutlog}.distance, ${table_workoutlog}.workout_workout_id, ${table_workoutlog}.session_session_id, workout_order, set_order, ${table_session}.created_at, ${table_session}.total_time`;
        const query = `SELECT ${fields} FROM ${table_workoutlog}
                        INNER JOIN ${table_session} ON ${table_session}.session_id = ${table_workoutlog}.session_session_id AND ${table_session}.is_deleted != 1
                        INNER JOIN ${table_userinfo} ON ${table_userinfo}.uid = ${table_session}.userinfo_uid AND ${table_userinfo}.privacy_setting != 1
                        LEFT JOIN ${table_templateUsers} ON ${table_templateUsers}.templateUsers_id = ${table_session}.templateUsers_template_id
                        ORDER BY ${table_workoutlog}.session_session_id DESC, ${table_workoutlog}.workout_order ASC, ${table_workoutlog}.set_order ASC`;
        try {
            let result = JSON.parse(JSON.stringify(await pool.queryParamMaster(query)));
            const restructure = async() => {
                let data = [];
                await asyncForEach(result, async(rowdata) => {
                    if (data.length == 0){
                        data.push({session_id: rowdata.session_session_id, uid: rowdata.userinfo_uid, name: rowdata.name, template_name: rowdata.template_name, session_detail: {date: rowdata.created_at, total_workout_time: rowdata.total_time, content: [{workout_id: rowdata.workout_workout_id, sets: [{reps: rowdata.reps, weight: rowdata.weight, duration: rowdata.duration, distance: rowdata.distance}]}]}});
                    }
                    else if (data[data.length-1].session_id == rowdata.session_session_id){
                        const L = data[data.length-1].session_detail.content.length
                        if (data[data.length-1].session_detail.content[L-1].workout_id == rowdata.workout_workout_id) {
                            data[data.length-1].session_detail.content[L-1].sets.push({reps: rowdata.reps, weight: rowdata.weight, duration: rowdata.duration, distance: rowdata.distance});
                        }
                        else {
                            data[data.length-1].session_detail.content.push({workout_id: rowdata.workout_workout_id, sets: [{reps: rowdata.reps, weight: rowdata.weight, duration: rowdata.duration, distance: rowdata.distance}]});
                        }
                    }
                    else {
                        data.push({session_id: rowdata.session_session_id, uid: rowdata.userinfo_uid, name: rowdata.name, template_name: rowdata.template_name, session_detail: {date: rowdata.created_at, total_workout_time: rowdata.total_time, content: [{workout_id: rowdata.workout_workout_id, sets: [{reps: rowdata.reps, weight: rowdata.weight, duration: rowdata.duration, distance: rowdata.distance}]}]}});
                    }
                });
                return data;
            }
            const data = await restructure();
            return data;
        } catch (err) {
            if (err.errno == 1062) {
                console.log('getWorkoutRecordById ERROR: ', err.errno, err.code);
                return -1;
            }
            console.log("getWorkoutRecordById ERROR: ", err);
            throw err;
        }
    }
}

module.exports = session;