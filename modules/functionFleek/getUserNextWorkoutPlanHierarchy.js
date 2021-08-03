const Workout = require('../../models/fleekWorkout');

const defaultIntensity = require('../algorithm/defaultIntensity');

module.exports = async(uid, workout_id, sex, ageGroup, weightGroup, percentage) => {
    const recentRecord = await Workout.getMostRecentWorkoutRecordById(workout_id, uid);
    if (recentRecord.length == 0) {
        const {min_step, inclination, intercept} =  await Workout.getWorkoutById(workout_id, sex, ageGroup, weightGroup);
        const {detail_plan} = await defaultIntensity(inclination, intercept, percentage, min_step);
        return detail_plan;
    } else {
        return recentRecord[0];
    }
}