export function isEqual(a: any, b: any) {
	return a === b;
}

export function isUndefined<T>(a: T) {
	return a === undefined;
}

export function undef<T, E>(value: T, defaultValue: E): T | E {
	return value === undefined ? defaultValue : value;
}
