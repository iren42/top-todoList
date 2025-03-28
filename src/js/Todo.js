import *  as Storage from "./storage.js";

export const TODO_TYPE = "TODO";

export const TODO_PREFIX = "- [ ] ";
export const TODO_PREFIX_DONE = "- [x] ";

export const TODO_SEPARATOR = "#";

export const PRIORITY_VAL1 = "low";
export const PRIORITY_VAL2 = "medium";
export const PRIORITY_VAL3 = "high";

function Todo(projectID, lineNumber, title = "", isChecked = "off")
{
    this.type = TODO_TYPE;
    this.description = "";
    this.dueDate = "";
    this.dueTime = "";
    this.title = title;
	this.lineNumber = lineNumber;
	this.isChecked = isChecked;
    this.id = todoController.getKey(lineNumber, projectID);
    this.priority = PRIORITY_VAL1;
    this.projectID = projectID;
}

export const todoController = (function ()
{
    function create(projectID, lineNumber, { title, isChecked })
    {
        const todo = new Todo(projectID, lineNumber, title, isChecked);
        Storage.setItem(todo.id, todo);
    }

    function update(target, source)
    {
        Object.assign(target, source);
        Storage.setItem(target.id, target);
    }

    function getKey(lineNumber, projectID)
    {
        return (`${ lineNumber }${ TODO_SEPARATOR }${ projectID }`);
    }

    function get(key)
    {

        const todo = Storage.getItem(key);
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
