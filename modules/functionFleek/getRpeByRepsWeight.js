const rirTable = require('../algorithm/rirTable');

module.exports = async(reps, ratio) => {
    //console.log(ratio, reps)
    const rir_list = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10];
    // array of tuples [diff, index]
    const diff_list = await Promise.all(rir_list.map(async(rir, index) => {
        const diff = Math.abs(ratio-rirTable[rir][reps-1]);
        return [diff, index];
    }))
    //console.log(diff_list)
    // tuple of min diff
    const min_diff_tuple = diff_list.reduce((min, p) => p[0] < min[0] ? p : min, diff_list[0]);
    return 10 - rir_list[min_diff_tuple[1]];
}