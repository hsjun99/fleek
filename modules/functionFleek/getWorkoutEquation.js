let WorkoutEquation = require("../../models/workoutEquation");

module.exports = async (workout_id, sex, ageGroup, weightGroup) => {
    const equationResult = await WorkoutEquation.getEquation(workout_id, sex, ageGroup, weightGroup);
    const {inclination, intercept} = equationResult;
    return {
        inclination: inclination,
        intercept: intercept
    }
}