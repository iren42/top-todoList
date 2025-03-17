import "./css/normalize.css";
import "./css/style.css";
import "./css/main.css";
import { marked } from "marked";
import DOMPurify from 'dompurify';

import { Project } from "./js/Project.js"
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
editor.addEventListener("input", event =>
{
    // preview.innerHTML = DOMPurify.sanitize(marked.parse(editor.innerText));
})

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

    function updateScreen(list)
    {
        console.log("load my project list, " + list.length);
        const projectListDiv = document.querySelector(".projectList");
        projectListDiv.innerHTML = "";
        editor.innerHTML = "";
        preview.innerHTML = "";

        for (let i = 0; i < list.length; i++)
        {
            const key = list.key(i);
            console.log(`key: ${ key }`);
            const stored = Storage.getItem(localStorage, key);
            const li = DOMCreator.project(stored.name, stored.id);
            projectListDiv.append(li);
        }
    }

    function view(where, what)
    {
        where.innerHTML = "";
        where.append(what);
    }

    function findParentElByClass(element, className)
    {
        if (!element.classList.contains(className))
        {
            while (!element.classList.contains(className))
            {
                element = element.parentElement;
            }
        }
        return (element);
    }

    function renameProject(element)
    {
        let IDElement = findParentElByClass(element, "project");
        if (!IDElement)
            throw new Error(`Could not find <button class="project">`);
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

    document.addEventListener("click", event =>
    {
        try
        {
            if (event.target.closest(".rename-project"))
            {
                renameProject(event.target);
            }
            else if (event.target.closest("#addNewProject"))
            {
                console.log("add a new project");
                const newProject = new Project();

                Storage.setItem(localStorage, newProject.id, newProject);

                view(editor, newProject.content);

                updateScreen(localStorage);
                const button = document.querySelector(`#${ CSS.escape(newProject.id) }`);
                if (!button)
                    throw new Error(`Project's ID ${ newProject.id } not found in DOM`);
                button.classList.add("active");
            }
            else if (event.target.closest("#clearBtn"))
            {
                console.log("clear data");
                Storage.clear(localStorage);
                updateScreen(localStorage);
            }
            else if (event.target.closest("#saveBtn"))
            {
                console.log("saving");
                const key = document.querySelector(".project.active").id;
                if (!key)
                    throw new Error(`Active project does not have an ID`);
                const stored = Storage.getItem(localStorage, key);
                if (!stored)
                    throw new Error(`No stored item for this key: ${ key }`);
                stored.content = editor.innerText;
                Storage.setItem(localStorage, stored.id, stored);
            }
            else if (event.target.closest("button.project"))
            {
                let target = findParentElByClass(event.target, "project");
                if (!target)
                    throw new Error(`Could not find <button class="project">`);
                removeActiveClasses();
                if (!(target.classList.contains("active")))
                    target.classList.add("active");
                const stored = Storage.getItem(localStorage, target.id);
                if (!stored)
                    throw new Error(`No stored item for this key: ${ target.id }`);
                view(editor, stored.content)
            }
            else;
        }
        catch (e)
        {
            console.error("In event listener:", e.message);
        }
    });

    updateScreen(localStorage);

    return ({
        updateScreen,
    })
})();