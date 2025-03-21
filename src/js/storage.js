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

export function getItem(list, key)
{
    return (JSON.parse(list.getItem(key)));
}

export function clear(list)
{
    list.clear();
}

export function removeItem(list, key)
{
    list.removeItem(key);
}

export function setItem(list, key, obj)
{
    list.setItem(key, JSON.stringify(obj));
}