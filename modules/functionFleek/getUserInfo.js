const ageGroupClassifier = require('../classifier/ageGroupClassifier');
const weightGroupClassifier = require('../classifier/weightGroupClassifier');

let User = require("../../models/fleekUser");

module.exports = async (uid) => {
    const profileResult = await User.getProfile(uid);
    const {name, sex, age, height, weight, percentage} = profileResult;
    const ageGroup = await ageGroupClassifier(age); // Conversion to Age Group
    const weightGroup = await weightGroupClassifier(weight, sex); // Conversion to Weight Group
    
    return {
        name: name,
        sex: sex,
        age: age,
        height: height,
        weight: weight,
        percentage: percentage,
        ageGroup: ageGroup,
        weightGroup: weightGroup
    }
}
