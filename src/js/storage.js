export function storageAvailable(type)
{
    let storage;
    try
    {
        storage = window[type];
        const x = "__storage_test__";
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    } catch (e)
    {
        return (
            e instanceof DOMException &&
            e.name === "QuotaExceededError" &&
            // acknowledge QuotaExceededError only if there's something already stored
            storage &&
            storage.length !== 0
        );
    }
}

export function printAll()
{
	for(let key in localStorage)
	{
		if(localStorage.hasOwnProperty(key))
			console.log(`${key} : ${localStorage[key]}`);
	}
}


export function getItem(key)
{
    return (JSON.parse(localStorage.getItem(key)));
}

export function clear()
{
    localStorage.clear();
}

export function removeItem(key)
{
    localStorage.removeItem(key);
}

export function getLength() {
	return (localStorage.length);
}

export function key(index)
{
	return (localStorage.key(index));
}

export function setItem(key, obj)
{
    localStorage.setItem(key, JSON.stringify(obj));
}
