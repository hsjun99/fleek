let WorkoutAbility = require("../../models/fleekWorkoutAbility");

module.exports = async (uid, workout_id) => {
    const oneRm = await WorkoutAbility.getWorkoutMaxOneRm(uid, workout_id);
    return oneRm;
}