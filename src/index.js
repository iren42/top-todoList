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
            // const stored = JSON.parse(list.getItem(key));
            const stored = Storage.getItem(localStorage, key);
            const li = DOMCreator.project(stored.name);
            projectListDiv.append(li);
        }
    }

    function view(where, what)
    {
        where.innerText = "";
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

    document.addEventListener("click", event =>
    {
        // console.log(event.target);
        // event.preventDefault();
        if (event.target.closest("#addNewProject"))
        {
            console.log("add a new project");
            const newProject = new Project();

            Storage.setItem(localStorage, newProject.name, newProject);

            // immediately open that new project on the editor view
            view(editor, newProject.content);
            updateScreen(localStorage);
            const active = document.querySelector(`#${ CSS.escape(newProject.name) }`);
            active.classList.add("active");
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
            // edit project obj 
            const key = document.querySelector(".project.active").id;
            if (!key)
                return;
            const activeProject = Storage.getItem(localStorage, key);
            activeProject.content = editor.innerText;
            Storage.setItem(localStorage, activeProject.name, activeProject);
        }
        else if (event.target.closest("button.project"))
        {
            console.log(`view: project `);
            let target = findParentElByClass(event.target, "project");
            if (!(target.classList.contains("active")))
                target.classList.add("active");
            const stored = Storage.getItem(localStorage, target.id);
            if (!stored)
                console.log(`no stored items: ${target.id}`);
            view(editor, stored.content)
        }
        else;
    });

    updateScreen(localStorage);

    return ({
        updateScreen,
    })
})();