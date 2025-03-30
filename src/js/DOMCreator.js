import *  as Storage from "./storage.js";
import { formatRelativeToNow } from "./date.js";
import { PRIORITY_VAL1, PRIORITY_VAL2, PRIORITY_VAL3 } from "./Todo.js";
import { PROJECT_TYPE, project } from "./Project.js";
import * as ERROR from "./error_constants.js";
import { overviewList } from "./overview.js";

import { differenceInMinutes, isAfter } from "date-fns";

export const CONTENTEDITABLE = "plaintext-only";

const CHECKBOX_SEPARATOR = "box:";
const DESCRIPTION_SEPARATOR = "des:";
const PRIORITY_SEPARATOR = "pri:";
const DUEDATE_SEPARATOR = "date:";
const DUETIME_SEPARATOR = "time:";
const TITLE_SEPARATOR = "titl:";

function getMinutesAndSeconds(time) {
	let s = time.split(":");
	if (s.length !== 2)
		throw new Error("Time format invalid: " + time);
	const ret = [
		Number(s[0]),
		Number(s[1])
	];
	return (ret);
}

function sortDates(a, b) {
	if (a.dueDate === b.dueDate) {
		if (a.dueTime === b.dueTime)
			return (0);
		if (!a.dueTime)
			return (1);
		if (!b.dueTime)
			return (-1);
		const [m1, s1] = getMinutesAndSeconds(a.dueTime);
		const [m2, s2] = getMinutesAndSeconds(b.dueTime);
		if (differenceInMinutes(new Date(2000, 1, 1, m1, s1),
			new Date(2000, 1, 1, m2, s2)) < 0)
			return (-1);
	}
	if (!a.dueDate)
		return (1);
	if (!b.dueDate)
		return (-1);
	if (isAfter(a.dueDate, b.dueDate))
		return (1);
	return (-1);
}

function checkTodoInput(list) {
	for (let i = 0; i < list.length; i++) {
		const inputEl = document.querySelector(`#${CSS.escape(list[i])}`);
		if (!inputEl)
			continue;
		inputEl.checked = true;
	}
}

function clearAll() {
	const leftDiv = document.querySelector(".left");
	if (!leftDiv)
		throw new Error(ERROR.CLASS("left"));
	leftDiv.innerHTML = "";
	const todoListDiv = document.querySelector(".todoList");
	if (!leftDiv)
		throw new Error(ERROR.CLASS("todoList"));
	todoListDiv.innerHTML = "";
}

function updateTodoList(todoArray) {
	const ul = document.querySelector(".todoList");
	ul.innerHTML = "";
	const IDArray = [];
	let radioID;
	let checkID;

	for (let i = 0; i < todoArray.length; i++) {
		ul.append(DOMCreator.todo(todoArray[i]));
		radioID = todoArray[i].priority + PRIORITY_SEPARATOR + todoArray[i].id;
		checkID = CHECKBOX_SEPARATOR + todoArray[i].id;

		IDArray.push(radioID);
		if (todoArray[i].isChecked === "on")
			IDArray.push(checkID);
	}
	checkTodoInput(IDArray);
}

function createEditor(projectObj) {
	if (!projectObj)
		throw new Error(ERROR.OBJ());
	const leftDiv = document.querySelector(".left");
	leftDiv.innerHTML = "";
	leftDiv.innerHTML = `
		<button type="button " id="saveBtn">Save</button>
		<div class="editor" contenteditable="${CONTENTEDITABLE}"  data-text="Write here..." >${projectObj.content}</div>
	`;
}

function openProject(projectObj) {
	createEditor(projectObj);

	const todoArr = project.createProjectTodoList(projectObj.id);
	updateTodoList(todoArr);
}

function openOverview(overviewObj) {
	const todoArr = project.createOverviewTodoList(overviewObj.fn);
	todoArr.sort(sortDates);
	updateTodoList(todoArr);
}

// in charge of updating the DOM
export const DOMCreator = (function() {
	function updateSidebar() {
		const len = Storage.getLength();
		const projectListDiv = document.querySelector(".projectList");
		projectListDiv.innerHTML = "";

		for (let i = 0; i < len; i++) {
			const key = Storage.key(i);
			const stored = Storage.getItem(key);
			if (!stored)
				return;
			if (stored.type === PROJECT_TYPE) {
				const li = project(stored.name, stored.id);
				projectListDiv.append(li);
			}
		}
	}

	function project(name, iud) {
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

	function todo(obj) {
		const li = document.createElement("li");

		const form = document.createElement("form");
		form.classList.add("todo", "collapse", obj.priority);
		form.id = obj.id;
		form.dataset.projectid = obj.projectID;
		form.innerHTML = `
		<label for="${TITLE_SEPARATOR}${obj.id}">Title:</label>
		<input
		  type="text"
		  id="${TITLE_SEPARATOR}${obj.id}"
		  name="title" value="${obj.title}"/>

            <label for="${DESCRIPTION_SEPARATOR}${obj.id}">Description:</label>
            <textarea id="${DESCRIPTION_SEPARATOR}${obj.id}" name="description" rows="5" class="description">${obj.description}</textarea>

            <label for="${DUEDATE_SEPARATOR}${obj.id}">Due date:</label>
            <input
            type="date"
            id="${DUEDATE_SEPARATOR}${obj.id}"
            value="${obj.dueDate}"
            name="dueDate"
            min="2020-01-01" />

            <label for="${DUETIME_SEPARATOR}${obj.id}">Due time:</label>
            <input
            type="time"
            id="${DUETIME_SEPARATOR}${obj.id}"
            value="${obj.dueTime}"
            name="dueTime" />

            <fieldset>
                <legend>Priority level:</legend>
                <div class="priority">
                    <input type="radio" id="${PRIORITY_VAL1}${PRIORITY_SEPARATOR}${obj.id}" name="priority" value="${PRIORITY_VAL1}" />
                    <label for="${PRIORITY_VAL1}${PRIORITY_SEPARATOR}${obj.id}">Low</label>
                    <input type="radio" id="${PRIORITY_VAL2}${PRIORITY_SEPARATOR}${obj.id}" name="priority" value="${PRIORITY_VAL2}" />
                    <label for="${PRIORITY_VAL2}${PRIORITY_SEPARATOR}${obj.id}">Medium</label>
                    <input type="radio" id="${PRIORITY_VAL3}${PRIORITY_SEPARATOR}${obj.id}" name="priority" value="${PRIORITY_VAL3}" />
                    <label for="${PRIORITY_VAL3}${PRIORITY_SEPARATOR}${obj.id}">High</label>
                </div>
            </fieldset>
            <div class="wrapper">
                <button type="submit" class="save-todo">Save</button>
                <button type="button" class="delete-todo">Delete</button>
            </div>
        `;

		const min = document.createElement("div");
		min.classList.add("min");

		const projectObj = Storage.getItem(obj.projectID);
		if (!projectObj)
			throw new Error(ERROR.KEY(obj.projectID));
		let dateToNow = "";
		if (obj.dueDate)
			dateToNow = formatRelativeToNow(obj.dueDate);
		min.innerHTML = `
			<input type="checkbox" id="${CHECKBOX_SEPARATOR}${obj.id}" name="isChecked" autocomplete="off">
            <label for="${CHECKBOX_SEPARATOR}${obj.id}">${obj.title}</label>
			<span class="projectName">${projectObj.name}</span>
            <span class="dueDate">${dateToNow} ${obj.dueTime}</span>
            <button type="button" class="expand-todo"><i class="fi fi-tr-square-plus"></i>
            </button>
        `;

		li.append(form);
		form.prepend(min);
		return (li);
	}

	function updateActive() {
		let active = document.querySelector(".active");
		if (!active) {
			active = document.querySelector("#todo-today");
			active.classList.add("active");
		}

		clearAll();
		if (active.classList.contains("project")) {
			const projectObj = Storage.getItem(active.id);
			if (!projectObj)
				throw new Error(ERROR.ID(active.id));
			openProject(projectObj);
		}
		else {
			const ov = overviewList.find(element => element.id === active.id);
			if (!ov)
				throw new Error(ERROR.ID(active.id));
			openOverview(ov);
		}
	}

	return ({
		todo,
		project,
		updateActive,
		updateSidebar,
	})
})();
