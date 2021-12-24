const Workout = require('../../models/fleekWorkout');

module.exports = async (workout_id, sex, ageGroup, weightGroup, percentage) => {
    const { min_step, inclination, intercept } = await Workout.getWorkoutById(workout_id, sex, ageGroup, weightGroup);
    const oneRM = Math.exp((percentage - intercept) / inclination);
    console.log(workout_id, oneRM, intercept, inclination, percentage)
    const calibratedWeight = Math.round(oneRM * 0.68 / min_step) * min_step;
    return calibratedWeight;
}