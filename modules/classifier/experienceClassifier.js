module.exports = async(experience) => {
    let expPercentage;
    if (experience < 3) {
        expPercentage = -50;
    } else if (experience < 7) {
        expPercentage = -25;
    } else if (experience < 11) {
        expPercentage = 0;
    } else if (experience < 18) {
        expPercentage = 30
    } else if (experience < 25) {
        expPercentage = 40;
    } else if (experience < 32) {
        expPercentage = 50;
    } else {
        expPercentage = 60;
    }
    return expPercentage;
}