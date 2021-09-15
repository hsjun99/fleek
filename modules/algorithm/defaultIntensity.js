module.exports = async(inclination, intercept, percentage, min_step) => {
    const oneRM = Math.exp((percentage-intercept)/inclination);
    const calibratedWeight = Math.floor(oneRM*0.68/min_step)*min_step;
    
    const plan = {
        "sets": 3,
        "reps": 10,
        "weight": calibratedWeight
    }
    const detail_plan = [
        {
            "reps": 10,
            "weight": calibratedWeight,
            "duration": 0,
            "distance": 0,
            "set_type": 0,
            "rpe": null
        },
        {
            "reps": 10,
            "weight": calibratedWeight,
            "duration": 0,
            "distance": 0,
            "set_type": 0,
            "rpe": null
        },
        {
            "reps": 10,
            "weight": calibratedWeight,
            "duration": 0,
            "distance": 0,
            "set_type": 0,
            "rpe": null
        }
    ]
    return {plan, detail_plan};
}