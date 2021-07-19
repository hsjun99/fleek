module.exports = async(inclination, intercept, experience=2) => {
    let expPercentage;
    switch (experience) {
        case 0:
            expPercentage = 5;
            break;
        case 1:
            expPercentage = 20;
            break;
        case 2:
            expPercentage = 50;
            break;
        case 3:
            expPercentage = 70;
            break;
    }
    const oneRM = Math.exp((expPercentage-intercept)/inclination);
    const calibratedWeight = Math.floor(oneRM*0.72/5)*5;
    
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