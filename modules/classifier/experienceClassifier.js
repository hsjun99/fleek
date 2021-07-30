module.exports = async(experience) => {
    let expPercentage;
    switch (experience) {
        case experience < 3:
            expPercentage = -50;
            break;
        case experience < 7:
            expPercentage = -25;
            break;
        case experience < 11:
            expPercentage = 0;
            break;
        case experience < 18:
            expPercentage = 10;
            break;   
        case experience < 25:
            expPercentage = 20;
            break;
        case 3:
            expPercentage = 70;
            break;
        default:
            expPercentage = 30;
    }
    return expPercentage;
}