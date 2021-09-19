const rirTable = require('../algorithm/rirTable');

module.exports = async(rpe, ratio) => {
    const rir = 10 - rpe;
    const diff_list = await Promise.all(rirTable[rir].map(async(value, index) => {
        const diff = Math.abs(ratio-value);
        return [diff, index];
    }));
    const min_diff_tuple = diff_list.reduce((min, p) => p[0] < min[0] ? p : min, diff_list[0]);
    return min_diff_tuple[1] + 1;
}