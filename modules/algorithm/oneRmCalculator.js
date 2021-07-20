module.exports = async(weight, reps) => {
    return 100 * weight / (48.8 + 53.8 * Math.exp(-0.075 * reps));
}