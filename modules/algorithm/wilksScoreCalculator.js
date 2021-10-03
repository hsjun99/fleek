module.exports = async(total_one_rm, sex, weight) => {
    let a, b, c, d, e, f;
    if (sex == 0) {
        a = (-1)*216.0475144;
        b = 16.2606339;
        c = (-1)*0.002388645;
        d = (-1)*0.00113732;
        e = 7.01863 * Math.pow(10, -6);
        f = (-1)*1.291 * Math.pow(10, -8);
    } else {
        a = 594.31747775582;
        b = (-1)*27.23842536447;
        c = 0.82112226871;
        d = (-1)*0.00930733913;
        e = 4.731582 * Math.pow(10, -5);
        f = (-1)*9.054 * Math.pow(10, -8);
    }
    return total_one_rm * 500 / (a + b*weight + c*Math.pow(weight, 2) + d*Math.pow(weight, 3) + e*Math.pow(weight, 4) + f*c*Math.pow(weight, 5));
}