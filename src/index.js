import "./css/normalize.css";
import "./css/style.css";
import DOMPurify from 'dompurify';

import { projectController } from "./js/Project.js"
import { CHECKBOX_SEPARATOR, DOMCreator } from "./js/DOMCreator.js";

if (process.env.NODE_ENV !== 'production')
{
    console.log('Looks like we are in development mode!');
}
{
    let sidebar = document.querySelector('.sidebar');
    let arrowCollapse = document.querySelector('#collapse-sidebar-icon');
    if (arrowCollapse && sidebar)
    {
        arrowCollapse.onclick = () =>
        {
            sidebar.classList.toggle('collapse');
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

const DOMController = (function ()
{
    const editor = document.querySelector(".editor");
    const preview = document.querySelector(".preview");

    function clearAll()
    {
        editor.contentEditable = false;
        editor.innerHTML = "";
        preview.innerHTML = "";
    }

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

    function openProject(projectObj)
    {
        clearAll();
        const IDElement = document.querySelector(`#${ CSS.escape(projectObj.id) }`);

        // only one 'active' HTMLelement
        removeActiveClasses();
        IDElement.classList.add("active");

        editor.contentEditable = true;
        view(editor, projectObj.content);

        DOMCreator.updateTodoList(localStorage, projectObj.id);
        // view(preview, ul);
    }

    function renameProject(eventTarget)
    {
        let IDElement = findParentElByClass(eventTarget, "project");
        if (!IDElement)
            throw new Error(`Could not find <button class="project">`);
        let textEl = IDElement.querySelector(".project-text");
        if (!textEl)
            throw new Error(`Could not find class="project-text"`);

        projectController.rename(localStorage, IDElement.id, textEl.innerText);
        eventTarget.contentEditable = false;
    }

    const projectListDiv = document.querySelector("ul.projectList");
    projectListDiv.addEventListener("focusout", event =>
    {
        if (event.target.closest(".project-text"))
        {
            renameProject(event.target);
        }
    })

    projectListDiv.addEventListener("keydown", event =>
    {
        if (event.key === "Enter" && event.target.closest(".project-text"))
        {
            event.preventDefault();
            renameProject(event.target);
        }
    })

    preview.addEventListener("change", event =>
    {
        if (event.target.closest("input[type='checkbox'][name='todo']"))
        {
            if (!(event.target instanceof HTMLInputElement))
                return;
            if (!event.target.id)
                throw new Error(`No id for this target: ${ event.target }`);

            let key = event.target.id.substring(CHECKBOX_SEPARATOR.length);
            projectController.updateTodoList(localStorage, key, event.target.checked);
            console.log("change state of checkbox to " + event.target.checked);
        }
    })

    document.addEventListener("click", event =>
    {
        if (event.target.closest(".expand-todo"))
        {
            let IDElement = findParentElByClass(event.target, "todo");
            if (!IDElement)
                throw new Error(`Could not find element with class="todo">`);
            IDElement.classList.toggle('collapse');
        }
        else if (event.target.closest(".delete-project"))
        {
            let IDElement = findParentElByClass(event.target, "project");
            if (!IDElement)
                throw new Error(`Could not find <button class="project">`);

            projectController.deleteP(localStorage, IDElement.id);
            clearAll();
            DOMCreator.updateSidebar(localStorage);
        }
        else if (event.target.closest(".rename-project"))
        {
            let IDElement = findParentElByClass(event.target, "project");
            if (!IDElement)
                throw new Error(`Could not find <button class="project">`);
            let textEl = IDElement.querySelector(".project-text");
            if (!textEl)
                throw new Error(`Could not find class="project-text"`);
            textEl.contentEditable = true;
            textEl.focus();
        }
        else if (event.target.closest("#addNewProject"))
        {
            console.log("add a new project");
            const newProject = projectController.create(localStorage);
            DOMCreator.updateSidebar(localStorage);
            openProject(newProject);
        }
        else if (event.target.closest("#clearBtn"))
        {
            console.log("clear data");
            clearAll();
            projectController.clearAll(localStorage);
            DOMCreator.updateSidebar(localStorage);
        }
        else if (event.target.closest("#saveBtn"))
        {
            console.log("saving");
            const IDElement = document.querySelector(".project.active");
            if (!IDElement)
                throw new Error(`No active project`);

            projectController.update(localStorage, IDElement.id, editor.innerText);

            const projectObj = projectController.get(localStorage, IDElement.id);
            if (!projectObj)
                throw new Error(`No stored item for this key: ${ IDElement.id }`);
            projectController.createTodoList(localStorage, projectObj);
            openProject(projectObj);
        }
        else if (event.target.closest("button.project"))
        {
            let IDElement = findParentElByClass(event.target, "project");
            if (!IDElement)
                throw new Error(`Could not find <button class="project">`);

            // query database
            const projectObj = projectController.get(localStorage, IDElement.id);
            if (!projectObj)
                throw new Error(`No stored item for this key: ${ IDElement.id }`);

            openProject(projectObj);
        }
        else;
    });

    DOMCreator.updateSidebar(localStorage);

    return ({
    })
})();