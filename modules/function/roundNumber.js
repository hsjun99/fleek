module.exports = {
    roundToNearest5: (x) => {
        return Math.round(x/5)*5;
    },
    roundNum: (x, min_step) => {
        return Math.round(x/min_step)*min_step;
    }
}