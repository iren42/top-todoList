import *  as Storage from "./storage.js";
import * as ERROR from "./error_constants.js"

export const TODO_TYPE = "TODO";

export const TODO_PREFIX = "- [ ] ";

export const TODO_SEPARATOR = "#";

export const PRIORITY_VAL1 = "low";
export const PRIORITY_VAL2 = "medium";
export const PRIORITY_VAL3 = "high";

function Todo(projectID, lineNumber, title = "", dueDate = new Date())
{
    this.type = TODO_TYPE;
    this.description = "";
    this.dueDate = dueDate;
    this.title = title;
    this.id = todoController.getKey(lineNumber, projectID);
    this.isChecked = false;
    this.priority = PRIORITY_VAL1;
    this.projectID = projectID;
}

export const todoController = (function ()
{
    function create(database, projectID, lineNumber, title)
    {
        const todo = new Todo(projectID, lineNumber, title);
        Storage.setItem(database, todo.id, todo);
    }

    function update(database, key, isChecked)
    {
        const stored = Storage.getItem(database, key);
        if (!stored)
            throw new Error(ERROR.KEY(key));
        if (stored.type !== TODO_TYPE)
            return;
        stored.isChecked = isChecked;
        Storage.setItem(database, key, stored);
    }

    function getKey(lineNumber, projectID)
    {
        return (`${ lineNumber }${ TODO_SEPARATOR }${ projectID }`);
    }

    function get(database, key)
    {

        const todo = Storage.getItem(database, key);
        if (!todo)
            return (null);
        return (todo);
    }

    return ({
        getKey,
        create,
        update,
        get
    });
})();