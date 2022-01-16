const ageGroupClassifier = require('../classifier/ageGroupClassifier');
const weightGroupClassifier = require('../classifier/weightGroupClassifier');

let User = require("../../models/fleekUser");

module.exports = async (uid) => {
    const profileResult = await User.getProfile(uid);
    const { name, sex, age, height, weight } = profileResult;
    const achievement = await User.getAchievement(uid, sex, weight);
    return {
        name: name,
        sex: sex,
        height: height,
        weight: weight,
        skeletal_muscle_mass: profileResult.skeletal_muscle_mass,
        body_fat_ratio: profileResult.body_fat_ratio,
        achievement: achievement
    }
}
