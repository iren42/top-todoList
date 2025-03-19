import "./css/normalize.css";
import "./css/style.css";
import { marked } from "marked";
import DOMPurify from 'dompurify';

import { Project, TYPE_PROJECT } from "./js/Project.js"
import { Todo, TYPE_TODO, TODO_PREFIX } from "./js/Todo.js";
import { DOMCreator } from "./js/DOMCreator.js";
import *  as Storage from "./js/storage.js";

if (process.env.NODE_ENV !== 'production')
{
    console.log('Looks like we are in development mode!');
}
{
    let sideBar = document.querySelector('.sidebar');
    let arrowCollapse = document.querySelector('#collapse-sidebar-icon');
    if (arrowCollapse && sideBar)
    {
        arrowCollapse.onclick = () =>
        {
            sideBar.classList.toggle('collapse');
            arrowCollapse.classList.toggle('collapse');
            if (arrowCollapse.classList.contains('collapse'))
            {
                arrowCollapse.classList = "fi fi-rr-angle-right collapse";
            }
            else
            {
                arrowCollapse.classList = "fi fi-rr-angle-left";
            }
        };
    }
}

const editor = document.querySelector(".editor");
const preview = document.querySelector(".preview");

const DOMController = (function ()
{
    function removeActiveClasses()
    {
        const list = document.querySelectorAll(".project.active");
        if (!list)
            return;
        for (let i = 0; i < list.length; i++)
        {
            list[i].classList.remove("active");
        }
    }

    function updateSidebar(list)
    {
        console.log("load my project list, " + list.length);
        const projectListDiv = document.querySelector(".projectList");
        projectListDiv.innerHTML = "";
        editor.innerHTML = "";
        preview.innerHTML = "";

        for (let i = 0; i < list.length; i++)
        {
            const key = list.key(i);
            // console.log(`key: ${ key }`);
            const stored = Storage.getItem(list, key);
            if (stored.type === TYPE_PROJECT)
            {
                const li = DOMCreator.project(stored.name, stored.id);
                projectListDiv.append(li);
            }
        }
    }

    function view(where, what)
    {
        where.innerHTML = "";
        where.append(what);
    }

    function findParentElByClass(element, className)
    {
        if (!(element instanceof HTMLElement))
            throw new Error(`Not a HTMLElement ${ element }`);
        if (!element.classList.contains(className))
        {
            while (!element.classList.contains(className))
            {
                element = element.parentElement;
            }
        }
        return (element);
    }

    function renameProject(IDElement)
    {
        if (!(IDElement instanceof HTMLElement))
            throw new Error(`Not a HTMLElement ${ IDElement }`);
        let textEl = IDElement.querySelector(".project-text");
        if (!textEl)
            throw new Error(`Could not find class="project-text"`);
        textEl.contentEditable = true;
        textEl.focus();
        textEl.addEventListener("keydown", event =>
        {
            if (event.key === "Enter")
            {
                event.preventDefault();
                // update database
                const stored = Storage.getItem(localStorage, IDElement.id);
                if (!stored)
                    throw new Error(`No stored item for this key: ${ IDElement.id }`);
                stored.name = textEl.innerText;
                Storage.setItem(localStorage, stored.id, stored);

                console.log(`renamed project to ${ stored.name }`);
                textEl.contentEditable = false;
            }
        })
    }

    function deleteProject(IDElement)
    {
        if (!(IDElement instanceof HTMLElement))
            throw new Error(`Not a HTMLElement ${ IDElement }`);
        // update database
        const stored = Storage.getItem(localStorage, IDElement.id);
        if (!stored)
            throw new Error(`No stored item for this key: ${ IDElement.id }`);
        Storage.removeItem(localStorage, IDElement.id);
    }

    function saveProject(database, obj)
    {
        if (!(obj instanceof Object))
            throw new Error(`Not an Object ${ obj }`);
        if (!editor)
            throw new Error(`No editor div`);
        obj.content = editor.innerText;
        Storage.setItem(database, obj.id, obj);
    }

    function openProject(projectObj)
    {
        const IDElement = document.querySelector(`#${ CSS.escape(projectObj.id) }`);

        // put the 'active' class only here and nowhere else
        removeActiveClasses();
        IDElement.classList.add("active");

        view(editor, projectObj.content)
        editor.contentEditable = true;
    }

    function isTodo(str)
    {
        if (!(typeof str === "string"))
            return (false);
        if (str.indexOf(TODO_PREFIX) !== 0)
            return (false);
        return (true);
    }

    function createTodoList(database, projectObj)
    {
        let lines = projectObj.content.split("\n");
        for (let i = 0; i < lines.length; i++)
        {
            if (isTodo(lines[i])) 
            {
                let title = lines[i].substring(TODO_PREFIX.length);
                const todo = new Todo(projectObj.id, i, title);
                Storage.setItem(database, todo.id, todo);
            }
        }
    }

    function openTodoList(database, projectObj)
    {
        const ul = document.createElement("ul");

        for (let i = 0; i < database.length; i++)
        {
            const key = database.key(i);
            const stored = Storage.getItem(database, key);
            if (!stored)
                throw new Error(`No stored item for this key: ${ key }`);
            if (stored.type === TYPE_TODO && stored.projectID === projectObj.id)
            {
                console.log(`key: ${ key }`);
                console.log(stored);
                const li = DOMCreator.todo(stored);
                ul.append(li);
            }
        }
        view(preview, ul);
    }

    document.addEventListener("click", event =>
    {
        try
        {
            if (event.target.closest(".delete-project"))
            {
                let IDElement = findParentElByClass(event.target, "project");
                deleteProject(IDElement);
                editor.contentEditable = false;
                updateSidebar(localStorage);
            }
            else if (event.target.closest(".rename-project"))
            {
                let IDElement = findParentElByClass(event.target, "project");
                if (!IDElement)
                    throw new Error(`Could not find <button class="project">`);
                renameProject(IDElement);
            }
            else if (event.target.closest("#addNewProject"))
            {
                console.log("add a new project");
                const newProject = new Project();

                Storage.setItem(localStorage, newProject.id, newProject);
                updateSidebar(localStorage);
                openProject(newProject);
            }
            else if (event.target.closest("#clearBtn"))
            {
                console.log("clear data");
                Storage.clear(localStorage);
                updateSidebar(localStorage);
            }
            else if (event.target.closest("#saveBtn"))
            {
                console.log("saving");
                const IDElement = document.querySelector(".project.active");
                if (!IDElement)
                    throw new Error(`No active project`);
                const projectObj = Storage.getItem(localStorage, IDElement.id);
                if (!projectObj)
                    throw new Error(`No stored item for this key: ${ IDElement.id }`);

                saveProject(localStorage, projectObj);
                createTodoList(localStorage, projectObj);
                openTodoList(localStorage, projectObj);
            }
            else if (event.target.closest("button.project"))
            {
                let IDElement = findParentElByClass(event.target, "project");
                if (!IDElement)
                    throw new Error(`Could not find <button class="project">`);

                // query database
                const projectObj = Storage.getItem(localStorage, IDElement.id);
                if (!projectObj)
                    throw new Error(`No stored item for this key: ${ IDElement.id }`);

                openProject(projectObj);
                openTodoList(localStorage, projectObj);
            }
            else;
        }
        catch (e)
        {
            console.error("In event listener:", e.message);
        }
    });

    updateSidebar(localStorage);

    return ({
        updateSidebar,
    })
})();