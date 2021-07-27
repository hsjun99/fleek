const pool = require('../modules/pool');
const asyncForEach = require('../modules/function/asyncForEach');



const table_templateUsers = 'templateUsers';
const table_templateUsersDetails = 'templateUsersDetails';
const table_templateDefault = 'templateDefault';
const table_templateDefaultDetails = 'templateDefaultDetails';

const table_alphaProgam = 'alphaProgram';
const table_alphaProgramUsers = 'alphaProgramUsers';
const table_equation = 'equation';

const workoutEquation = require('./workoutEquation');

const alphaProgram = require('../modules/algorithm/alphaProgram');
const defaultIntensityWeightOnly = require('../modules/algorithm/defaultIntensityWeightOnly');

const min_step = 5;

const template = {
    getAllProgram: async(uid) => {
        const fields1 = 'alphaProgram_id, name, weeks, days, objective, target';
        const fields2 = 'is_done';
        const query1 = `SELECT ${fields1} FROM ${table_alphaProgam}`;
        try {
            const result = await pool.queryParamMaster(query1);
            const restructure = async() => {
                let data = [];
                await asyncForEach(result, async(rowdata) => {
                    const query2 = `SELECT ${fields2} FROM ${table_alphaProgam}
                                    INNER JOIN ${table_alphaProgramUsers} ON ${table_alphaProgam}.alphaProgram_id = ${table_alphaProgramUsers}.alphaProgram_alphaProgram_id AND ${table_alphaProgramUsers}.userinfo_uid = '${uid}' AND ${table_alphaProgam}.alphaProgram_id = ${rowdata.alphaProgram_id}
                                    LIMIT 1`;
                    const currentStatus = await pool.queryParamArrMaster(query2);
                    if (currentStatus.length == 0) {
                        data.push({alphaProgram_id: rowdata.alphaProgram_id, name: rowdata.name, weeks: rowdata.weeks, days: rowdata.days, objective: rowdata.objective, target: rowdata.target, status: false});
                    }
                    else if (currentStatus[0].is_done == 1) {
                        data.push({alphaProgram_id: rowdata.alphaProgram_id, name: rowdata.name, weeks: rowdata.weeks, days: rowdata.days, objective: rowdata.objective, target: rowdata.target, status: false});
                    }
                    else {
                        data.push({alphaProgram_id: rowdata.alphaProgram_id, name: rowdata.name, weeks: rowdata.weeks, days: rowdata.days, objective: rowdata.objective, target: rowdata.target, status: true});
                    }
                });
                return data;
            }
            const data = await restructure();
            return data;
           // console.log(data)
           // console.log(JSON.parse(String(data[0].workouts_by_tier_default)));

        } catch (err) {
            if (err.errno == 1062) {
                console.log('getAllProgram ERROR: ', err.errno, err.code);
                return -1;
            }
            console.log("getAllProgram ERROR: ", err);
            throw err;
        }
    },
    checkProgramUserStatus: async(uid, program_id) => {
        const fields = 'is_done';
        const query = `SELECT ${fields} FROM ${table_alphaProgam}
                        INNER JOIN ${table_alphaProgramUsers} ON ${table_alphaProgam}.alphaProgram_id = ${table_alphaProgramUsers}.alphaProgram_alphaProgram_id AND ${table_alphaProgramUsers}.userinfo_uid = '${uid}' AND ${table_alphaProgam}.alphaProgram_id = ${program_id}
                        LIMIT 1`;
        try {
            const result = await pool.queryParamMaster(query);
            if (result.length == 0){
                return false;
            } else if (result[0].is_done == 1) {
                return false;
            } else {
                return true;
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
    getProgramData: async(uid, program_id) => {
        const fields1 = 'alphaProgram_id, alphaProgramUsers_id, name, weeks, days, objective, target, progress, workouts_by_tier, one_rms_by_tier';
        const fields2 = 'alphaProgramUsers_id, progress, workouts_by_tier, one_rms_by_tier, alphaProgram_alphaProgram_id';
        const questions1 = '?, ?, ?, ?, ?, ?, ?';
        const query =  `SELECT ${fields1} FROM ${table_alphaProgam}
                        INNER JOIN
                        (SELECT ${fields2} FROM ${table_alphaProgramUsers}
                         WHERE ${table_alphaProgramUsers}.userinfo_uid='${uid}' AND ${table_alphaProgramUsers}.alphaProgram_alphaProgram_id = ${program_id} AND ${table_alphaProgramUsers}.is_done = 0
                         LIMIT 1)
                        AS T1
                        ON T1.alphaProgram_alphaProgram_id = ${table_alphaProgam}.alphaProgram_id`;
        try {
            const result = await pool.queryParamMaster(query);
            const workouts_by_tier = JSON.parse(result[0].workouts_by_tier).workouts_by_tier;
            const one_rms_by_tier = JSON.parse(result[0].one_rms_by_tier).one_rms_by_tier;
            const programOutline = alphaProgram[result[0].name](workouts_by_tier);
            const restructure = async() => {
                let data = [];
                await asyncForEach(programOutline, async(sessionPlan) => {
                    data.push([]);
                    await asyncForEach(sessionPlan, async(workoutPlan) => {
                        await data[data.length-1].push({workout_id: workoutPlan.workout_id, workout_tier_index: workoutPlan.workout_tier_index, detail_plan:[]});
                        await asyncForEach([...Array(workoutPlan.reps.length).keys()], async(index) => {
                            const one_rm = one_rms_by_tier[workoutPlan.workout_tier_index[0]-1][workoutPlan.workout_tier_index[1]-1]
                            await data[data.length-1][data[data.length-1].length-1].detail_plan.push({reps: workoutPlan.reps[index], weight: Math.floor(one_rm * workoutPlan.load[index]/min_step)*min_step + min_step * workoutPlan.minStepConstant[index], rest_time: workoutPlan.restTime[index]})
                        })
                    })
                });
                return data;
            }
            const data = await restructure();
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
            //console.log(result[0].name, result[0].workouts_by_tier, alphaProgram[result[0].name], JSON.parse(result[0].workouts_by_tier))
            //console.log(alphaProgram[result[0].name](JSON.parse(result[0].workouts_by_tier).workouts_by_tier));
            
        } catch (err) {
            if (err.errno == 1062) {
                console.log('getProgramData ERROR: ', err.errno, err.code);
                return -1;
            }
            console.log("getProgramData ERROR: ", err);
            throw err;
        }
    },
    getProgramWorkoutsDataByTier: async(uid, program_id, sex, ageGroup, weightGroup) => {
        const fields1 = 'workouts_by_tier_default, t1, t2, t3, t4';
        const fields2 = 'inclination, intercept';
        const query1 = `SELECT ${fields1} FROM ${table_alphaProgam}
                        WHERE ${table_alphaProgam}.alphaProgram_id = ${program_id}`;
        try {
            const result1 = await pool.queryParamMaster(query1);
            const t1 = result1[0].t1, t2 = result1[0].t2, t3 = result1[0].t3, t4 = result1[0].t4;
            const workouts_by_tier_default = JSON.parse(result1[0].workouts_by_tier_default).workouts_by_tier_default;
            let one_rms_by_tier = [
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            ];
            await Promise.all([0, 1, 2, 3].map(async (tier, index1) => {
                await Promise.all(workouts_by_tier_default[tier].map(async (elem, index2) => {
                    if (!elem == 0) {
                        const {inclination, intercept} = await workoutEquation.getEquation(elem, sex, ageGroup, weightGroup);
                        const oneRm = await defaultIntensityWeightOnly(inclination, intercept);
                        one_rms_by_tier[index1][index2] = oneRm.toFixed(2);
                    }
                }))
            }))
            return {workouts_by_tier_default, one_rms_by_tier};

        } catch (err) {
            if (err.errno == 1062) {
                console.log('getAllProgram ERROR: ', err.errno, err.code);
                return -1;
            }
            console.log("getAllProgram ERROR: ", err);
            throw err;
        }
    },
    initializeProgram: async(uid, program_id, workouts_by_tier_default, one_rms_by_tier) => {
        const fields = 'progress, workouts_by_tier, one_rms_by_tier, is_done, alphaProgram_alphaProgram_id, userinfo_uid';
        const questions = '?, ?, ?, ?, ?, ?';
        const workouts_by_tier_default_String = JSON.stringify({workouts_by_tier: workouts_by_tier_default});
        const one_rms_by_tier_String = JSON.stringify({one_rms_by_tier: one_rms_by_tier});
        const values = [0, workouts_by_tier_default_String, one_rms_by_tier_String, 0, program_id, uid];
        const query = `INSERT INTO ${table_alphaProgramUsers}(${fields}) VALUES(${questions})`;
        try {
            const result = await pool.queryParamArrMaster(query, values);
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