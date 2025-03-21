import *  as Storage from "./storage.js";
import { TODO_TYPE } from "./Todo.js";
import { PROJECT_TYPE } from "./Project.js"

export const CHECKBOX_SEPARATOR = "box:";
export const DOMCreator = (function ()
{
    function updateSidebar(database)
    {
        const projectListDiv = document.querySelector(".projectList");
        projectListDiv.innerHTML = "";

        for (let i = 0; i < database.length; i++)
        {
            const key = database.key(i);
            // console.log(`key: ${ key }`);
            const stored = Storage.getItem(database, key);
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
        // li.classList.add("project");

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
        const div = document.createElement("div");
        div.classList.add("todo", "collapse");

        const form = document.createElement("form");
        form.innerHTML = `
            <div class="description" contentEditable=true>${ obj.description }</div>
            <div class="priority" contentEditable=true>${ obj.priority }</div>

            <div class="wrapper">
            <button type="submit" class="save-todo">Save</button>
            <button type="button" class="delete-todo">Delete</button>
            </div>
        `;

        const wrapper = document.createElement("div");
        wrapper.classList.add("mini");

        wrapper.innerHTML = `
            <label for="${ CHECKBOX_SEPARATOR }${ obj.id }">${ obj.title } + ${ obj.dueDate }</label>
            <button type="button" class="expand-todo"><i class="fi fi-rr-plus-small"></i></button>
        `;
        const checkbox = document.createElement("input");
        checkbox.setAttribute("type", "checkbox");
        checkbox.id = `${ CHECKBOX_SEPARATOR }${ obj.id }`;
        checkbox.name = "todo";
        checkbox.checked = obj.isChecked;

        li.append(div);
        div.append(form);
        form.prepend(wrapper);
        wrapper.prepend(checkbox);
        return (li);
    }

    function updateTodoList(database, projectID)
    {
        const preview = document.querySelector(".preview");
        preview.innerHTML = "";
        const ul = document.createElement("ul");
        ul.classList.add("todoList");

        for (let i = 0; i < database.length; i++)
        {
            const key = database.key(i);
            const stored = Storage.getItem(database, key);
            if (!stored)
                throw new Error(`No stored item for this key: ${ key }`);
            if (stored.type === TODO_TYPE && stored.projectID === projectID)
            {
                console.log(`key: ${ key }`);
                console.log(stored);
                const li = todo(stored);
                ul.append(li);
            }
        }
        preview.append(ul);
    }

    return ({
        updateTodoList,
        updateSidebar
    })
})();
