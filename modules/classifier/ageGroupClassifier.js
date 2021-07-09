module.exports = async (age) => {
    let group;
    if (age <= 17) group=0;
    else if (age <= 23) group=1;
    else if (age <= 39) group=2;
    else if (age <= 49) group=3;
    else if (age <= 59) group=4;
    else if (age <= 69) group=5;
    else if (age <= 79) group=6;
    else group=7;
    return group;
}