const pool = require('../modules/pool');
const asyncForEach = require('../modules/function/asyncForEach');
const moment = require('moment');
var momentDurationFormatSetup = require("moment-duration-format");

const table_workout = 'workout';
const table_equation = 'equation';
const table_workoutlog = 'workoutlog';
const table_session = 'session';
const table_userinfo = 'userinfo';
const table_follows = 'follows';

const workout = {
    getWorkoutById: async (workout_id, sex, age, weight) => {
        const fields = 'english, korean, category, muscle_p, muscle_s1, muscle_s2, muscle_s3, muscle_s4, muscle_s5, muscle_s6, equipment, record_type, inclination, intercept';
        const query = `SELECT ${fields} FROM ${table_workout} 
                        LEFT JOIN ${table_equation} ON ${table_workout}.workout_id = ${table_equation}.workout_workout_id
                        WHERE ${table_workout}.workout_id="${workout_id}" 
                            AND (inclination IS NULL
                                    OR (${table_equation}.sex="${sex}" AND (${table_equation}.age="${age}" OR ${table_equation}.age=8) AND ${table_equation}.weight="${weight}"))`;
        try {
            const result = await pool.queryParamSlave(query);
            return result[0];
        } catch (err) {
            if (err.errno == 1062) {
                console.log('getWorkoutById ERROR: ', err.errno, err.code);
                return -1;
            }
            console.log("getWorkoutById ERROR: ", err);
            throw err;
        }
    },
    getWorkoutRecordById: async (workout_id, uid) => {
        const fields = 'reps, weight, session_session_id, created_at';
        const query = `SELECT ${fields} FROM ${table_workoutlog}
                        INNER JOIN ${table_session} ON ${table_session}.session_id = ${table_workoutlog}.session_session_id AND ${table_session}.userinfo_uid = ${uid} AND ${table_workoutlog}.workout_workout_id = ${workout_id}
                        ORDER BY ${table_workoutlog}.session_session_id DESC, ${table_workoutlog}.set_order ASC`;
        try {
            let result = JSON.parse(JSON.stringify(await pool.queryParamSlave(query)));
            const restructure = async() => {
                let data = [];
                await asyncForEach(result, async(rowdata) => {
                    if (data.length == 0){
                        data.push([{reps:rowdata.reps, weight:rowdata.weight, session_id: rowdata.session_session_id, created_at: rowdata.created_at}]);
                    }
                    else if (data[data.length-1][0].session_id == rowdata.session_session_id){
                        data[data.length-1].push({reps:rowdata.reps, weight:rowdata.weight, session_id: rowdata.session_session_id, created_at: rowdata.created_at});
                    }
                    else {
                        data.push([{reps:rowdata.reps, weight:rowdata.weight, session_id: rowdata.session_session_id, created_at: rowdata.created_at}]);
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
    },
    checkWorkout: async (workout_id) => {
        const query = `SELECT * FROM ${table_workout} WHERE workout_id="${workout_id}"`;
        try {
            const result = await pool.queryParamSlave(query);
            if (result.length === 0) {
                return false;
            } else return true
        } catch (error) {
            if (err.errno == 1062) {
                console.log('checkWorkout Error : ', err.errno, err.code);
                return -1;
            }
            console.log('checkWorkout Error : ', err);
            throw err;
        }
    },
    getUsersWorkoutRecordById: async (workout_id, uid) => {
        const fields = `${table_userinfo}.name, DISTINCT_SESSION.session_id, ${table_workoutlog}.reps, ${table_workoutlog}.weight, ${table_workoutlog}.duration, ${table_workoutlog}.distance, DISTINCT_SESSION.created_at`;
        /*
        const queryALL = `SELECT ${fields} FROM ${table_workoutlog}
                        INNER JOIN ${table_session} ON ${table_workoutlog}.session_session_id = ${table_session}.session_id AND ${table_workoutlog}.workout_workout_id = ${workout_id}
                        INNER JOIN ${table_userinfo} ON ${table_session}.userinfo_uid = ${table_userinfo}.uid
                        ORDER BY ${table_workoutlog}.session_session_id DESC, ${table_workoutlog}.set_order ASC`;
                        */
        const query = `SELECT ${fields} FROM ${table_workoutlog}
                        INNER JOIN
                        (SELECT DISTINCT ${table_session}.session_id, ${table_session}.created_at, ${table_session}.userinfo_uid
                        FROM ${table_session}
                        INNER JOIN ${table_workoutlog} ON ${table_workoutlog}.session_session_id = ${table_session}.session_id AND ${table_workoutlog}.workout_workout_id = ${workout_id}
                        WHERE ${table_session}.userinfo_uid != ${uid}
                        ORDER BY ${table_workoutlog}.session_session_id DESC
                        LIMIT 5) AS DISTINCT_SESSION
                        ON DISTINCT_SESSION.session_id = ${table_workoutlog}.session_session_id AND ${table_workoutlog}.workout_workout_id = ${workout_id}
                        INNER JOIN ${table_userinfo} ON DISTINCT_SESSION.userinfo_uid = ${table_userinfo}.uid
                        ORDER BY ${table_workoutlog}.session_session_id DESC, ${table_workoutlog}.set_order ASC`;
        try {
            let result = JSON.parse(JSON.stringify(await pool.queryParamSlave(query)));
            const now = moment();
            const currenttime = await now.format("YYYY-MM-DD HH:mm:ss");

            const restructure = async() => {
                let data = [];
                await asyncForEach(result, async(rowdata) => {
                    const timeDiffArr = await moment.duration(moment(currenttime,"YYYY-MM-DD HH:mm:ss").diff(moment(rowdata.created_at,"YYYY-MM-DD HH:mm:ss"))).format("d,h,m").split(',');
                    await timeDiffArr.forEach((part, index, theArray)=>{theArray[index]=Number(part)});
                    if (timeDiffArr.length==1) timeDiffArr.unshift(0, 0);
                    else if (timeDiffArr.length==2) timeDiffArr.unshift(0);

                    if (data.length == 0){
                        data.push({name: rowdata.name, session_id: rowdata.session_id, time: timeDiffArr, log: [{reps:rowdata.reps, weight:rowdata.weight, duration: rowdata.duration, distance: rowdata.distance}]});
                    }
                    else if (data[data.length-1].session_id == rowdata.session_id){
                        data[data.length-1].log.push({reps:rowdata.reps, weight:rowdata.weight, duration: rowdata.duration, distance: rowdata.distance});
                    }
                    else {
                        data.push({name: rowdata.name, session_id: rowdata.session_id, time: timeDiffArr, log: [{reps:rowdata.reps, weight:rowdata.weight, duration: rowdata.duration, distance: rowdata.distance}]});
                    }
                });
                return data;
            }
            const data = await restructure();
            return data;
            
        } catch (err) {
            if (err.errno == 1062) {
                console.log('getUsersWorkoutRecordById ERROR: ', err.errno, err.code);
                return -1;
            }
            console.log("getUsersWorkoutRecordById ERROR: ", err);
            throw err;
        }
    },
    getFollowsWorkoutRecordById: async (workout_id, uid) => {
        const fields = `${table_userinfo}.name, DISTINCT_SESSION.session_id, ${table_workoutlog}.reps, ${table_workoutlog}.weight, ${table_workoutlog}.duration, ${table_workoutlog}.distance, DISTINCT_SESSION.created_at`;

        const query = `SELECT ${fields} FROM ${table_workoutlog}
                        INNER JOIN
                        (SELECT DISTINCT ${table_session}.session_id, ${table_session}.created_at, ${table_session}.userinfo_uid
                        FROM ${table_session}
                        INNER JOIN ${table_workoutlog} ON ${table_workoutlog}.session_session_id = ${table_session}.session_id AND ${table_workoutlog}.workout_workout_id = ${workout_id}
                        INNER JOIN ${table_follows} ON ${table_follows}.follow_uid = ${table_session}.userinfo_uid AND ${table_follows}.userinfo_uid = ${uid}
                        WHERE ${table_session}.userinfo_uid != ${uid}
                        ORDER BY ${table_workoutlog}.session_session_id DESC
                        LIMIT 5) AS DISTINCT_SESSION
                        ON DISTINCT_SESSION.session_id = ${table_workoutlog}.session_session_id AND ${table_workoutlog}.workout_workout_id = ${workout_id}
                        INNER JOIN ${table_userinfo} ON DISTINCT_SESSION.userinfo_uid = ${table_userinfo}.uid
                        ORDER BY ${table_workoutlog}.session_session_id DESC, ${table_workoutlog}.set_order ASC`; // INNER JOIN ${table_follows} ON ${table_userinfo}.uid = ${table_follows}.follow_uid AND ${table_follows}.userinfo_uid = ${uid}
        try {
            let result = JSON.parse(JSON.stringify(await pool.queryParamSlave(query)));
            const now = moment();
            const currenttime = await now.format("YYYY-MM-DD HH:mm:ss");

            const restructure = async() => {
                let data = [];
                await asyncForEach(result, async(rowdata) => {
                    const timeDiffArr = await moment.duration(moment(currenttime,"YYYY-MM-DD HH:mm:ss").diff(moment(rowdata.created_at,"YYYY-MM-DD HH:mm:ss"))).format("d,h,m").split(',');
                    await timeDiffArr.forEach((part, index, theArray)=>{theArray[index]=Number(part)});
                    if (timeDiffArr.length==1) timeDiffArr.unshift(0, 0);
                    else if (timeDiffArr.length==2) timeDiffArr.unshift(0);

                    if (data.length == 0){
                        data.push({name: rowdata.name, session_id: rowdata.session_id, time: timeDiffArr, log: [{reps:rowdata.reps, weight:rowdata.weight, duration: rowdata.duration, distance: rowdata.distance}]});
                    }
                    else if (data[data.length-1].session_id == rowdata.session_id){
                        data[data.length-1].log.push({reps:rowdata.reps, weight:rowdata.weight, duration: rowdata.duration, distance: rowdata.distance});
                    }
                    else {
                        data.push({name: rowdata.name, session_id: rowdata.session_id, time: timeDiffArr, log: [{reps:rowdata.reps, weight:rowdata.weight, duration: rowdata.duration, distance: rowdata.distance}]});
                    }
                });
                return data;
            }
            const data = await restructure();
            return data;
            
        } catch (err) {
            if (err.errno == 1062) {
                console.log('getFollowsWorkoutRecordById ERROR: ', err.errno, err.code);
                return -1;
            }
            console.log("getFollowsWorkoutRecordById ERROR: ", err);
            throw err;
        }
    }
}

module.exports = workout;