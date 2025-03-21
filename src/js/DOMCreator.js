import *  as Storage from "./storage.js";
import { TODO_TYPE, PRIORITY_VAL1, PRIORITY_VAL2, PRIORITY_VAL3 } from "./Todo.js";
import { PROJECT_TYPE } from "./Project.js"

const CHECKBOX_SEPARATOR = "box:";
const DESCRIPTION_SEPARATOR = "des:";
const PRIORITY_SEPARATOR = "pri:";

// in charge of reading and displaying
export const DOMCreator = (function ()
{
    function updateSidebar(database)
    {
        const projectListDiv = document.querySelector(".projectList");
        projectListDiv.innerHTML = "";

        for (let i = 0; i < database.length; i++)
        {
            const key = database.key(i);
            const stored = Storage.getItem(database, key);
            if (!stored)
                return;
            if (stored.type === PROJECT_TYPE)
            {
                const li = project(stored.name, stored.id);
                projectListDiv.append(li);
            }
        }
    }

    function project(name, iud)
    {
        const li = document.createElement("li");

        const button = document.createElement("button");
        button.type = "button";
        button.classList.add("project");
        button.id = iud;

        const icon = document.createElement("i");
        icon.classList.add("fi", "fi-rr-file", "project-icon");

        const spanText = document.createElement("span");
        spanText.classList.add("project-text");
        spanText.textContent = name;

        const spanTooltip = document.createElement("span");
        spanTooltip.classList.add("tooltip");
        spanTooltip.textContent = name;

        const dropdown = document.createElement("div");
        dropdown.classList.add("dropdown");

        const dropdownBtn = document.createElement("i");
        dropdownBtn.classList.add("fi", "fi-rr-menu-dots", "dropbtn");

        const dropdownContent = document.createElement("div");
        dropdownContent.classList.add("dropdown-content");
        dropdownContent.innerHTML = `
        <div class="rename-project">Rename</div>
        <div class="delete-project">Delete</div>
        `;

        dropdown.append(dropdownBtn, dropdownContent);

        button.append(icon, spanText, spanTooltip, dropdown);
        li.append(button);
        return (li);
    }

    function todo(obj)
    {
        const li = document.createElement("li");

        const form = document.createElement("form");
        form.classList.add("todo", "collapse");
        form.id = obj.id;
        form.dataset.projectid = obj.projectID;
        form.innerHTML = `
            <label for="${ DESCRIPTION_SEPARATOR }${ obj.id }">Description:</label>
            <textarea id="${ DESCRIPTION_SEPARATOR }${ obj.id }" name="description" rows="5" class="description" value="${ obj.description }"></textarea>

            <fieldset>
                <legend>Priority level:</legend>
                <div class="priority">
                    <input type="radio" id="${ PRIORITY_VAL1 }${ PRIORITY_SEPARATOR }${ obj.id }" name="priority" value="${ PRIORITY_VAL1 }" />
                    <label for="${ PRIORITY_VAL1 }${ PRIORITY_SEPARATOR }${ obj.id }">Low</label>
                    <input type="radio" id="${ PRIORITY_VAL2 }${ PRIORITY_SEPARATOR }${ obj.id }" name="priority" value="${ PRIORITY_VAL2 }" />
                    <label for="${ PRIORITY_VAL2 }${ PRIORITY_SEPARATOR }${ obj.id }">Medium</label>
                    <input type="radio" id="${ PRIORITY_VAL3 }${ PRIORITY_SEPARATOR }${ obj.id }" name="priority" value="${ PRIORITY_VAL3 }" />
                    <label for="${ PRIORITY_VAL3 }${ PRIORITY_SEPARATOR }${ obj.id }">High</label>
                </div>
            </fieldset>
            <div class="wrapper">
                <button type="submit" class="save-todo">Save</button>
                <button type="button" class="delete-todo">Delete</button>
            </div>
        `;

        const wrapper = document.createElement("div");
        wrapper.classList.add("min");

        wrapper.innerHTML = `
            <label for="${ CHECKBOX_SEPARATOR }${ obj.id }">${ obj.title }</label>
            <span class="dueDate">${ obj.dueDate }</span>
            <button type="button" class="expand-todo"><i class="fi fi-tr-square-plus"></i>
            </button>
        `;
        const checkbox = document.createElement("input");
        checkbox.setAttribute("type", "checkbox");
        checkbox.id = `${ CHECKBOX_SEPARATOR }${ obj.id }`;
        checkbox.name = "todo";
        checkbox.checked = obj.isChecked;

        li.append(form);
        form.prepend(wrapper);
        wrapper.prepend(checkbox);
        return (li);
    }

    function isTodoFromThisProject(todo, projectID)
    {
        return (todo.type === TODO_TYPE && todo.projectID === projectID)
    }

    function updateTodoList(database, projectID)
    {
        const preview = document.querySelector(".preview");
        preview.innerHTML = "";
        const ul = document.createElement("ul");
        ul.classList.add("todoList");
        let prioriry;

        for (let i = 0; i < database.length; i++)
        {
            const key = database.key(i);
            const stored = Storage.getItem(database, key);
            if (!stored)
                return;
            if (isTodoFromThisProject(stored, projectID))
            {
                const li = todo(stored);
                ul.append(li);
                prioriry = stored.priority + PRIORITY_SEPARATOR + stored.id;
            }
        }
        preview.append(ul);
        const radioEl = document.querySelector(`#${ CSS.escape(prioriry) }`);
        radioEl.checked = true;
    }

    return ({
        updateTodoList,
        updateSidebar
    })
})();
