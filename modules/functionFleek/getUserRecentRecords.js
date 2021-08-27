const Workout = require('../../models/fleekWorkout');
//console.log(Workout)
module.exports = async (workout_id, uid) => {
    
    const {recentRecords, rest_time} = await Workout.getWorkoutRecordById(workout_id, uid);
    return {recentRecords, rest_time};
}