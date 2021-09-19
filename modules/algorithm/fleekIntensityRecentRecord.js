const rirTable = require('./rirTable');

const roundNumber = require('../function/roundNumber');

const rpe_step = 1;

const rpeByRepsWeight = (reps, ratio) => {
    const rir = ((1/ratio)-1)/0.03333 - reps;
    return roundNumber.roundNum(10 - rir, 1);
}

const repsByRpeWeight = (rpe, ratio) => {
    const reps = ((1/ratio)-1)/0.03333 - (10-rpe);
    return roundNumber.roundNum(reps, 1);
}

const ratioByRpeReps = (rpe, reps) => {
    const ratio = 1 / (0.0333*(reps+(10-rpe))+1)
    return ratio;
}


module.exports = async(most_recent_record, max_one_rm, min_step) => {
    return await Promise.all([-2, -1, 0, 1, 2].map(async(rpe_const) => {
        return await Promise.all(most_recent_record.map(async(set) => {
            if (rpe_const == 0){
                return {
                    reps: set.reps,
                    weight: set.weight,
                    rpe: rpeByRepsWeight(set.reps, set.weight/max_one_rm)
                }
            }

            let new_rpe;
            let new_weight, new_reps=set.reps;
            const curr_rpe = rpeByRepsWeight(set.reps, set.weight/max_one_rm);
            new_rpe = curr_rpe+rpe_const*rpe_step;

            const new_ratio = ratioByRpeReps(new_rpe, set.reps)
 
            new_weight = roundNumber.roundNum(new_ratio * max_one_rm, min_step);

            if (new_weight == set.weight) {
                const orig_ratio = set.weight/max_one_rm;
                new_reps = Math.max(1, repsByRpeWeight(new_rpe, orig_ratio))
                if (curr_rpe < 0) new_reps = set.reps;
                
                return {
                    reps: new_reps,
                    weight: new_weight,
                    rpe: rpeByRepsWeight(new_reps, new_weight/max_one_rm)
                }
            } else {
                return {
                    reps: new_reps,
                    weight: new_weight,
                    rpe: rpeByRepsWeight(new_reps, new_weight/max_one_rm)
                }
            }
        }));
    }));
}

/*
module.exports = async(most_recent_record, max_one_rm, min_step) => {
    return await Promise.all([-2, -1, 0, 1, 2].map(async(rpe_const) => {
        return await Promise.all(most_recent_record.map(async(set) => {
            if (rpe_const == 0){
                return {
                    reps: set.reps,
                    weight: set.weight,
                    rpe: await getRpeByRepsWeight(set.reps, set.weight/max_one_rm)
                }
            }

            let new_rpe;
            let new_weight, new_reps=set.reps;
            if (set.reps <= 30){
                const curr_rpe = await getRpeByRepsWeight(set.reps, set.weight/max_one_rm);
                new_rpe = Math.max(0, curr_rpe+rpe_const*rpe_step);
                new_rpe = Math.min(10, new_rpe);
                if ((new_rpe == 10 && curr_rpe == 10) || (new_rpe == 0 && curr_rpe == 0)) {
                    new_weight = roundNumber.roundNum(set.weight + min_step*rpe_const, min_step);
                    new_weight = Math.max(0, new_weight);
                    return {
                        reps: set.reps,
                        weight: new_weight,
                        rpe: await getRpeByRepsWeight(set.reps, new_weight/max_one_rm)
                    }
                }

                const new_ratio = rirTable[10-new_rpe][set.reps];
                //console.log(curr_rpe, new_rpe, set.weight/max_one_rm, new_ratio)
                new_weight = roundNumber.roundNum(new_ratio * max_one_rm, min_step);

                if (new_weight == set.weight) {
                    const orig_ratio = set.weight/max_one_rm;

                    if (new_rpe == curr_rpe) {
                        new_weight = roundNumber.roundNum(set.weight + min_step*rpe_const, min_step);
                        new_weight = Math.max(0, new_weight);

                    } else {
                        new_reps = await getRepsByRpeWeight(new_rpe, orig_ratio);
                    }
                    return {
                        reps: new_reps,
                        weight: new_weight,
                        rpe: await getRpeByRepsWeight(new_reps, new_weight/max_one_rm)
                    }
                } else {
                    return {
                        reps: new_reps,
                        weight: new_weight,
                        rpe: await getRpeByRepsWeight(new_reps, new_weight/max_one_rm)
                    }
                }
            } else {
                new_weight = roundNumber.roundNum(set.weight + min_step*rpe_const, min_step);
                new_weight = Math.max(0, new_weight);
                return {
                    reps: set.reps,
                    weight: new_weight,
                    rpe: await getRpeByRepsWeight(30, new_weight/max_one_rm)
                }
            }
        }));
    }));
}
*/