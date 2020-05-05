export function round(num: number, decimalPlaces: number = 0) {
    return tonumber(string.format(`%.${decimalPlaces}f`, num))
}