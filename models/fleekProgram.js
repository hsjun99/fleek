const pool = require('../modules/pool');
const asyncForEach = require('../modules/function/asyncForEach');

const table_alphaProgam = 'alphaProgram';
const table_alphaProgramUsers = 'alphaProgramUsers';

const alphaProgram = require('../modules/algorithm/alphaProgram');

const rirTable = require('../modules/algorithm/rirTable');

const getUserInfo = require('../modules/functionFleek/getUserInfo');
const getWorkoutEquation = require('../modules/functionFleek/getWorkoutEquation');
const getOneRm = require('../modules/functionFleek/getOneRm');
const getWorkoutInfo = require('../modules/functionFleek/getWorkoutInfo');

const roundNumber = require('../modules/function/roundNumber');

const template = {
    getAllProgram: async (uid) => {
        const fields1 = 'alphaProgram_id, name, weeks, days, objective, target';
        const fields2 = 'is_done';
        const query1 = `SELECT ${fields1} FROM ${table_alphaProgam}`;
        const restructure = async (result) => {
            let data = [];
            await asyncForEach(result, async (rowdata) => {
                const query2 = `SELECT ${fields2} FROM ${table_alphaProgam}
                                INNER JOIN ${table_alphaProgramUsers} ON ${table_alphaProgam}.alphaProgram_id = ${table_alphaProgramUsers}.alphaProgram_alphaProgram_id AND ${table_alphaProgramUsers}.userinfo_uid = '${uid}' AND ${table_alphaProgam}.alphaProgram_id = ${rowdata.alphaProgram_id}
                                LIMIT 1`;
                const currentStatus = await pool.queryParamArrMaster(query2);
                if (currentStatus.length == 0) {
                    data.push({ alphaProgram_id: rowdata.alphaProgram_id, name: rowdata.name, weeks: rowdata.weeks, days: rowdata.days, objective: rowdata.objective, target: rowdata.target, status: false });
                }
                else if (currentStatus[0].is_done == 1) {
                    data.push({ alphaProgram_id: rowdata.alphaProgram_id, name: rowdata.name, weeks: rowdata.weeks, days: rowdata.days, objective: rowdata.objective, target: rowdata.target, status: false });
                }
                else {
                    data.push({ alphaProgram_id: rowdata.alphaProgram_id, name: rowdata.name, weeks: rowdata.weeks, days: rowdata.days, objective: rowdata.objective, target: rowdata.target, status: true });
                }
            });
            return data;
        }
        try {
            const result = await pool.queryParamMaster(query1);
            const data = await restructure(result);
            return data;
        } catch (err) {
            if (err.errno == 1062) {
                console.log('getAllProgram ERROR: ', err.errno, err.code);
                return -1;
            }
            console.log("getAllProgram ERROR: ", err);
            throw err;
        }
    },
    checkProgramUserStatus: async (uid, program_id) => {
        const fields = 'is_done, progress';
        const query = `SELECT ${fields} FROM ${table_alphaProgam}
                        INNER JOIN ${table_alphaProgramUsers} ON ${table_alphaProgam}.alphaProgram_id = ${table_alphaProgramUsers}.alphaProgram_alphaProgram_id AND ${table_alphaProgramUsers}.userinfo_uid = '${uid}' AND ${table_alphaProgam}.alphaProgram_id = ${program_id}
                        ORDER BY ${table_alphaProgramUsers}.alphaProgramUsers_id DESC
                        LIMIT 1`;
        try {
            const result = await pool.queryParamMaster(query);
            if (result.length == 0) { // Not Initialized
                return 0;
            } else if (result[0].is_done == 1) { // Not Initialized
                return 0;
            } else if (result[0].progress == 0) { // Progress 0
                return 1;
            } else { // Initialized and Over Progress 1
                return 2;
            }
        } catch (err) {
            if (err.errno == 1062) {
                console.log('checkProgramUserStatus ERROR: ', err.errno, err.code);
                return -1;
            }
            console.log("checkProgramUserStatus ERROR: ", err);
            throw err;
        }
    },
    getProgramData: async (uid, program_id) => {
        const fields1 = 'alphaProgram_id, alphaProgramUsers_id, name, weeks, days, objective, target, progress, workouts_index, one_rms_index';
        const fields2 = 'alphaProgramUsers_id, progress, workouts_index, one_rms_index, alphaProgram_alphaProgram_id';
        const query = `SELECT ${fields1} FROM ${table_alphaProgam}
                        INNER JOIN
                        (SELECT ${fields2} FROM ${table_alphaProgramUsers}
                         WHERE ${table_alphaProgramUsers}.userinfo_uid='${uid}' AND ${table_alphaProgramUsers}.alphaProgram_alphaProgram_id = ${program_id} AND ${table_alphaProgramUsers}.is_done = 0
                         LIMIT 1)
                        AS T1
                        ON T1.alphaProgram_alphaProgram_id = ${table_alphaProgam}.alphaProgram_id`;

        /*
        const getWorkoutArr = async(programOutline) => {
            let workoutArr = [];
            await asyncForEach(programOutline, async(sessionPlan) => {
                workoutArr.push([]);
                await asyncForEach(sessionPlan, async(workoutPlan) => {
                    workoutArr[workoutArr.length-1].push(workoutPlan.workout_id);
                })
            })
            return workoutArr;
        }
        const getMinStep = async(workoutArr) => {
            let minStepArr = new Array(workoutArr.length).fill([]);
            await Promise.all(workoutArr.map(async (workout_id, index) => {

            }))
        }*/
        const restructure = async (programOutline, one_rms_index) => {
            let data = [];
            await asyncForEach(programOutline, async (sessionPlan) => {
                data.push([]);
                await asyncForEach(sessionPlan, async (workoutPlan) => {
                    await data[data.length - 1].push({ workout_id: workoutPlan.workout_id, workouts_index: workoutPlan.workouts_index, detail_plan: [] });
                    const { min_step } = await getWorkoutInfo(workoutPlan.workout_id);
                    await asyncForEach([...Array(workoutPlan.reps.length).keys()], async (index) => {
                        const one_rm = one_rms_index[workoutPlan.workouts_index - 1];
                        let load;
                        if (workoutPlan.rir == null) {
                            load = workoutPlan.load[index];
                        } else {
                            load = rirTable[workoutPlan.rir][workoutPlan.reps[index] - 1];
                        }
                        await data[data.length - 1][data[data.length - 1].length - 1].detail_plan.push({ reps: workoutPlan.reps[index], weight: roundNumber.roundNum(one_rm * load + min_step * workoutPlan.minStepConstant[index], min_step), rest_time: workoutPlan.restTime[index] })
                    })
                })
            });
            return data;
        }

        try {
            const result = await pool.queryParamMaster(query);
            const workouts_index = JSON.parse(result[0].workouts_index).workouts_index;
            const one_rms_index = JSON.parse(result[0].one_rms_index).one_rms_index;
            const programOutline = alphaProgram[result[0].name](workouts_index);
            // const workoutArr = await getWorkoutArr(programOutline);
            const data = await restructure(programOutline, one_rms_index);
            return {
                name: result[0].name,
                alphaProgramUsers_id: result[0].alphaProgramUsers_id,
                weeks: result[0].weeks,
                days: result[0].days,
                objective: result[0].objective,
                target: result[0].target,
                progress: result[0].progress,
                program_detail: data
            };
        } catch (err) {
            if (err.errno == 1062) {
                console.log('getProgramData ERROR: ', err.errno, err.code);
                return -1;
            }
            console.log("getProgramData ERROR: ", err);
            throw err;
        }
    },
    getProgramWorkoutsDataByIndex: async (uid, program_id, sex, ageGroup, weightGroup, percentage) => {
        const fields1 = 'workouts_index_default, t1, t2, t3, t4';
        const query1 = `SELECT ${fields1} FROM ${table_alphaProgam}
                        WHERE ${table_alphaProgam}.alphaProgram_id = ${program_id}`;
        try {
            const result1 = await pool.queryParamMaster(query1);
            const workouts_index_default = JSON.parse(result1[0].workouts_index_default).workouts_index;
            let one_rms_index = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

            const { sex, percentage, ageGroup, weightGroup } = await getUserInfo(uid);
            await Promise.all(workouts_index_default.map(async (elem, index) => {
                if (!elem == 0) {
                    const { inclination, intercept } = await getWorkoutEquation(elem, sex, ageGroup, weightGroup);
                    let oneRm = await getOneRm(uid, workouts_index_default[index]);
                    if (oneRm == 0) {
                        oneRm = Math.exp((percentage - intercept) / inclination);
                    }
                    one_rms_index[index] = oneRm.toFixed(2);
                    if (elem == 45) await console.log(elem, oneRm, index, sex, ageGroup, weightGroup, intercept, inclination)
                }
            }));
            return { workouts_index_default, one_rms_index };

        } catch (err) {
            if (err.errno == 1062) {
                console.log('getAllProgram ERROR: ', err.errno, err.code);
                return -1;
            }
            console.log("getAllProgram ERROR: ", err);
            throw err;
        }
    },
    initializeProgram: async (uid, program_id, workouts_index_default, one_rms_index) => {
        const fields = 'progress, workouts_index, one_rms_index, is_done, alphaProgram_alphaProgram_id, userinfo_uid';
        const questions = '?, ?, ?, ?, ?, ?';
        const workouts_index_default_String = JSON.stringify({ workouts_index: workouts_index_default });
        const one_rms_index_String = JSON.stringify({ one_rms_index: one_rms_index });
        const values = [0, workouts_index_default_String, one_rms_index_String, 0, program_id, uid];
        const query = `INSERT INTO ${table_alphaProgramUsers}(${fields}) VALUES(${questions})`;
        try {
            const result = await pool.queryParamArrMaster(query, values);
            return result;
        } catch (err) {
            if (err.errno == 1062) {
                console.log('initializeProgram ERROR: ', err.errno, err.code);
                return -1;
            }
            console.log("initializeProgram ERROR: ", err);
            throw err;
        }
    }
}

module.exports = template;