export function round(num: number, decimalPlaces: number = 0) {
    let mult = Math.pow(10, decimalPlaces);
    return math.floor(num * mult + 0.5) / mult;
}