import { TODO_PREFIX, todoController, TODO_SEPARATOR } from "./Todo.js";
import *  as Storage from "./storage.js";
import * as ERROR from "./error_constants.js"

export const PROJECT_TYPE = "PROJECT";

function Project(name = "New project", creationDate = new Date())
{
    this.id = uid();
    this.name = name;
    this.content = "";
    this.lastEditDate = creationDate;
    this.creationDate = creationDate;
    this.type = PROJECT_TYPE;
}

function uid()
{
    return (Date.now().toString(36) + Math.random().toString(36).substring(2));
}

function isTodo(str)
{
    if (!(typeof str === "string"))
        return (false);
    if (str.indexOf(TODO_PREFIX) !== 0)
        return (false);
    return (true);
}

export const projectController = (function ()
{
    function removeTodoSurplus(database, projectObj, limit)
    {
        for (let i = 0; i < database.length; i++)
        {
            const key = database.key(i);
            const stored = Storage.getItem(database, key);
            if (!stored)
                throw new Error(ERROR.KEY(key));
            if (stored.type === PROJECT_TYPE)
                continue;
            if (stored.projectID !== projectObj.id)
                continue;
            let index = stored.id.indexOf(TODO_SEPARATOR);
            let num = stored.id.substring(0, index);
            if (Number(num) < limit)
                continue;
            remove(localStorage, key);
        }
    }

    function updateTodoList(database, projectObj)
    {
        // update todos that have different title
        let lines = projectObj.content.split("\n");
        removeTodoSurplus(database, projectObj, lines.length);
        for (let i = 0; i < lines.length; i++)
        {
            const title = lines[i].substring(TODO_PREFIX.length);
            const key = todoController.getKey(i, projectObj.id);
            if (!isTodo(lines[i]))
            {
                Storage.removeItem(database, key);
                continue;
            }
            let todo = Storage.getItem(database, key);
            if (!todo)
                todoController.create(database, projectObj.id, i, title);
        }
    }

    function create(database)
    {
        const newProject = new Project();
        Storage.setItem(database, newProject.id, newProject);
        return (newProject);
    }

    // 'delete' is a reserved word
    function remove(database, key)
    {
        console.log("remove " + key);
        Storage.removeItem(database, key);
    }

    function update(database, key, newContent)
    {
        const projectObj = Storage.getItem(database, key);
        if (!projectObj)
            throw new Error(ERROR.KEY(key));
        if (projectObj.type !== PROJECT_TYPE)
            return;
        projectObj.content = newContent;
        Storage.setItem(database, projectObj.id, projectObj);
    }

    function get(database, key)
    {
        const projectObj = Storage.getItem(database, key);
        if (!projectObj)
            return (null);
        return (projectObj);
    }

    function updateTodo(database, key, isChecked)
    {
        todoController.update(database, key, isChecked);
    }

    function rename(database, key, newName)
    {
        const stored = Storage.getItem(database, key);
        if (!stored)
            throw new Error(ERROR.KEY(key));
        if (stored.type !== PROJECT_TYPE)
            return;
        stored.name = newName;
        Storage.setItem(database, stored.id, stored);
        console.log(`renamed project to ${ stored.name }`);
    }

    function clearAll(database)
    {
        Storage.clear(database);
    }

    return ({
        updateTodoList,
        updateTodo,
        create,
        update,
        get,
        remove,
        clearAll,
        rename
    })
})();