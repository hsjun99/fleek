const Workout = require('../../models/fleekWorkout');

module.exports = async(workout_id) => {
    const workoutData = await Workout.getWorkoutInfo(workout_id);

    return workoutData;
}