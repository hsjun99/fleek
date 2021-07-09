const roundToNearest5 = x => Math.round(x/5)*5

module.exports = async (weight, sex) => {
    let weightGroup = roundToNearest5(weight);
    if (sex == 1) {
        if (weightGroup < 40) weightGroup = 40;
        else if (weightGroup > 120) weightGroup = 120;
    } else {
        if (weightGroup < 50) weightGroup = 50;
        else if (weightGroup > 140) weightGroup = 140;
    }
    return weightGroup;
}