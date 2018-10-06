export function isEqual(a, b) {
    return a + '' === b + '';
}

export function isUndefined(a) {
    return a === undefined;
}

export function undef(a, b) {
    return a === undefined ? b : a;
}