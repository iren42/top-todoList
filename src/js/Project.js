import { TODO_PREFIX, todoController } from "./Todo.js";
import *  as Storage from "./storage.js";

export const PROJECT_TYPE = "PROJECT";
export function Project(name = "New project", creationDate = new Date())
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
    function createTodoList(database, projectObj)
    {
        let lines = projectObj.content.split("\n");
        for (let i = 0; i < lines.length; i++)
        {
            if (isTodo(lines[i]))
            {
                const title = lines[i].substring(TODO_PREFIX.length);
                const key = todoController.getKey(i, projectObj.id);

                // check is todo already exists
                let todo = Storage.getItem(database, key);
                if (!todo)
                    todoController.create(database, projectObj.id, i, title);
            }
        }
    }

    function create(database)
    {
        const newProject = new Project();
        Storage.setItem(database, newProject.id, newProject);
        return (newProject);
    }

    // 'delete' is a reserved word
    function deleteP(database, key)
    {
        Storage.removeItem(database, key);
    }

    function update(database, key, newContent)
    {
        const projectObj = Storage.getItem(database, key);
        if (!projectObj)
            return (null);
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

    function updateTodoList(database, key, isChecked)
    {
        todoController.update(database, key, isChecked);
    }

    return ({
        createTodoList,
        updateTodoList,
        create,
        update,
        get,
        deleteP
    })
})();