const ageGroupClassifier = require("../classifier/ageGroupClassifier");
const weightGroupClassifier = require("../classifier/weightGroupClassifier");
// const dotenv = require("dotenv");
// dotenv.config();

let User = require("../../models/fleekUser");

module.exports = async uid => {
  const profileResult = await User.getProfile(uid);
  const { name, sex, age, height, weight, percentage, profile_url, instagram_id, is_beta, created_at } = profileResult;
  const ageGroup = await ageGroupClassifier(age); // Conversion to Age Group
  const weightGroup = await weightGroupClassifier(weight, sex); // Conversion to Weight Group
  const achievement = await User.getAchievement(uid, sex, weight);
  return {
    name: name,
    sex: sex,
    age: age,
    height: height,
    weight: weight,
    skeletal_muscle_mass: profileResult.skeletal_muscle_mass,
    body_fat_ratio: profileResult.body_fat_ratio,
    percentage: percentage,
    ageGroup: ageGroup,
    weightGroup: weightGroup,
    privacy_setting: profileResult.privacy_setting,
    body_info_history: profileResult.body_info_history,
    achievement: achievement,
    profile_url: profile_url,
    instagram_id: instagram_id,
    is_beta: is_beta
  };
};
