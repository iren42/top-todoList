export function storageAvailable(type) {
	let storage;
	try {
		storage = window[type];
		const x = "__storage_test__";
		storage.setItem(x, x);
		storage.removeItem(x);
		return true;
	} catch (error) {
		return (
			error instanceof DOMException &&
			error.name === "QuotaExceededError" &&
			// Acknowledge QuotaExceededError only if there's something already stored
			storage &&
			storage.length > 0
		);
	}
}

export function printAll() {
	for (const key in localStorage) {
		if (Object.hasOwn(localStorage, key)) {
			console.log(`${key} : ${localStorage[key]}`);
		}
	}
}

export function getItem(key) {
	return JSON.parse(localStorage.getItem(key));
}

export function clear() {
	localStorage.clear();
}

export function removeItem(key) {
	localStorage.removeItem(key);
}

export function getLength() {
	return localStorage.length;
}

export function key(index) {
	return localStorage.key(index);
}

export function setItem(key, object) {
	localStorage.setItem(key, JSON.stringify(object));
}
