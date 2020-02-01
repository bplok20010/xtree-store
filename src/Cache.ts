export default class Cache<T> {
	_caches = Object.create(null);

	set(key: string, value: T[]) {
		this._caches[key] = value;
	}
	get(key: string): T[] {
		return this._caches[key];
	}
	has(key: string) {
		return key in this._caches;
	}
	delete(key: string) {
		delete this._caches[key];
	}
	clear() {
		this._caches = Object.create(null);
	}
}
