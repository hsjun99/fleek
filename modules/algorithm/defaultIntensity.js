module.exports = async(inclination, intercept, percentage) => {
    const oneRM = Math.exp((percentage-intercept)/inclination);
    const calibratedWeight = Math.floor(oneRM*0.68/5)*5;
    
    const plan = {
        "sets": 3,
        "reps": 10,
        "weight": calibratedWeight
    }
    const detail_plan = [
        {
            "reps": 10,
            "weight": calibratedWeight
        },
        {
            "reps": 10,
            "weight": calibratedWeight
        },
        {
            "reps": 10,
            "weight": calibratedWeight
        }
    ]
    return {plan, detail_plan};
}