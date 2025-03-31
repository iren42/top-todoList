import { differenceInMinutes, isAfter } from "date-fns";
import * as Storage from "./storage.js";
import { formatRelativeToNow } from "./date.js";
import { PRIORITY_VAL1, PRIORITY_VAL2, PRIORITY_VAL3 } from "./Todo.js";
import { PROJECT_TYPE, project } from "./Project.js";
import * as ERROR from "./error_constants.js";
import { overviewList } from "./overview.js";

export const CONTENTEDITABLE = "plaintext-only";

const CHECKBOX_SEPARATOR = "box:";
const DESCRIPTION_SEPARATOR = "des:";
const PRIORITY_SEPARATOR = "pri:";
const DUEDATE_SEPARATOR = "date:";
const DUETIME_SEPARATOR = "time:";
const TITLE_SEPARATOR = "titl:";

function getMinutesAndSeconds(time) {
	const s = time.split(":");
	if (s.length !== 2) {
		throw new Error("Time format invalid: " + time);
	}

	const returnValue = [Number(s[0]), Number(s[1])];
	return returnValue;
}

function sortDates(a, b) {
	if (a.dueDate === b.dueDate) {
		if (a.dueTime === b.dueTime) {
			return 0;
		}

		if (!a.dueTime) {
			return 1;
		}

		if (!b.dueTime) {
			return -1;
		}

		const [m1, s1] = getMinutesAndSeconds(a.dueTime);
		const [m2, s2] = getMinutesAndSeconds(b.dueTime);
		if (
			differenceInMinutes(
				new Date(2000, 1, 1, m1, s1),
				new Date(2000, 1, 1, m2, s2),
			) < 0
		) {
			return -1;
		}
	}

	if (!a.dueDate) {
		return 1;
	}

	if (!b.dueDate) {
		return -1;
	}

	if (isAfter(a.dueDate, b.dueDate)) {
		return 1;
	}

	return -1;
}

function checkTodoInput(list) {
	for (const element of list) {
		const inputElement = document.querySelector(`#${CSS.escape(element)}`);
		if (!inputElement) {
			continue;
		}

		inputElement.checked = true;
	}
}

function clearAll() {
	const leftDiv = document.querySelector(".left");
	if (!leftDiv) {
		throw new Error(ERROR.CLASS("left"));
	}

	leftDiv.innerHTML = "";
	const todoListDiv = document.querySelector(".todoList");
	if (!leftDiv) {
		throw new Error(ERROR.CLASS("todoList"));
	}

	todoListDiv.innerHTML = "";
}

function updateTodoList(todoArray) {
	const ul = document.querySelector(".todoList");
	ul.innerHTML = "";
	const IDArray = [];
	let radioID;
	let checkID;

	for (const element of todoArray) {
		ul.append(DOMCreator.todo(element));
		radioID = element.priority + PRIORITY_SEPARATOR + element.id;
		checkID = CHECKBOX_SEPARATOR + element.id;

		IDArray.push(radioID);
		if (element.isChecked === "on") {
			IDArray.push(checkID);
		}
	}

	checkTodoInput(IDArray);
}

function createEditor(projectObject) {
	if (!projectObject) {
		throw new Error(ERROR.OBJ());
	}

	const leftDiv = document.querySelector(".left");
	leftDiv.innerHTML = "";
	leftDiv.innerHTML = `
		<button type="button " id="saveBtn">Save</button>
		<div class="editor" contenteditable="${CONTENTEDITABLE}"  data-text="Write here..." >${projectObject.content}</div>
	`;
}

function openProject(projectObject) {
	createEditor(projectObject);

	const todoArray = project.createProjectTodoList(projectObject.id);
	updateTodoList(todoArray);
}

function openOverview(overviewObject) {
	const todoArray = project.createOverviewTodoList(overviewObject.fn);
	todoArray.sort(sortDates);
	updateTodoList(todoArray);
}

// In charge of updating the DOM
export const DOMCreator = (function () {
	function updateSidebar() {
		const length = Storage.getLength();
		const projectListDiv = document.querySelector(".projectList");
		projectListDiv.innerHTML = "";

		for (let i = 0; i < length; i++) {
			const key = Storage.key(i);
			const stored = Storage.getItem(key);
			if (!stored) {
				return;
			}

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

		const dropdownButton = document.createElement("i");
		dropdownButton.classList.add("fi", "fi-rr-menu-dots", "dropbtn");

		const dropdownContent = document.createElement("div");
		dropdownContent.classList.add("dropdown-content");
		dropdownContent.innerHTML = `
        <div class="rename-project">Rename</div>
        <div class="delete-project">Delete</div>
        `;

		dropdown.append(dropdownButton, dropdownContent);

		button.append(icon, spanText, spanTooltip, dropdown);
		li.append(button);
		return li;
	}

	function todo(object) {
		const li = document.createElement("li");

		const form = document.createElement("form");
		form.classList.add("todo", "collapse", object.priority);
		form.id = object.id;
		form.dataset.projectid = object.projectID;
		form.innerHTML = `
		<label for="${TITLE_SEPARATOR}${object.id}">Title:</label>
		<input
		  type="text"
		  id="${TITLE_SEPARATOR}${object.id}"
		  name="title" value="${object.title}"/>

            <label for="${DESCRIPTION_SEPARATOR}${object.id}">Description:</label>
            <textarea id="${DESCRIPTION_SEPARATOR}${object.id}" name="description" rows="5" class="description">${object.description}</textarea>

            <label for="${DUEDATE_SEPARATOR}${object.id}">Due date:</label>
            <input
            type="date"
            id="${DUEDATE_SEPARATOR}${object.id}"
            value="${object.dueDate}"
            name="dueDate"
            min="2020-01-01" />

            <label for="${DUETIME_SEPARATOR}${object.id}">Due time:</label>
            <input
            type="time"
            id="${DUETIME_SEPARATOR}${object.id}"
            value="${object.dueTime}"
            name="dueTime" />

            <fieldset>
                <legend>Priority level:</legend>
                <div class="priority">
                    <input type="radio" id="${PRIORITY_VAL1}${PRIORITY_SEPARATOR}${object.id}" name="priority" value="${PRIORITY_VAL1}" />
                    <label for="${PRIORITY_VAL1}${PRIORITY_SEPARATOR}${object.id}">Low</label>
                    <input type="radio" id="${PRIORITY_VAL2}${PRIORITY_SEPARATOR}${object.id}" name="priority" value="${PRIORITY_VAL2}" />
                    <label for="${PRIORITY_VAL2}${PRIORITY_SEPARATOR}${object.id}">Medium</label>
                    <input type="radio" id="${PRIORITY_VAL3}${PRIORITY_SEPARATOR}${object.id}" name="priority" value="${PRIORITY_VAL3}" />
                    <label for="${PRIORITY_VAL3}${PRIORITY_SEPARATOR}${object.id}">High</label>
                </div>
            </fieldset>
            <div class="wrapper">
                <button type="submit" class="save-todo">Save</button>
                <button type="button" class="delete-todo">Delete</button>
            </div>
        `;

		const min = document.createElement("div");
		min.classList.add("min");

		const projectObject = Storage.getItem(object.projectID);
		if (!projectObject) {
			throw new Error(ERROR.KEY(object.projectID));
		}

		let dateToNow = "";
		if (object.dueDate) {
			dateToNow = formatRelativeToNow(object.dueDate);
		}

		min.innerHTML = `
			<input type="checkbox" id="${CHECKBOX_SEPARATOR}${object.id}" name="isChecked" autocomplete="off">
            <label for="${CHECKBOX_SEPARATOR}${object.id}">${object.title}</label>
			<span class="projectName">${projectObject.name}</span>
            <span class="dueDate">${dateToNow} ${object.dueTime}</span>
            <button type="button" class="expand-todo"><i class="fi fi-tr-square-plus"></i>
            </button>
        `;

		li.append(form);
		form.prepend(min);
		return li;
	}

	function updateActive() {
		let active = document.querySelector(".active");
		if (!active) {
			active = document.querySelector("#todo-today");
			active.classList.add("active");
		}

		clearAll();
		if (active.classList.contains("project")) {
			const projectObject = Storage.getItem(active.id);
			if (!projectObject) {
				throw new Error(ERROR.ID(active.id));
			}

			openProject(projectObject);
		} else {
			const ov = overviewList.find((element) => element.id === active.id);
			if (!ov) {
				throw new Error(ERROR.ID(active.id));
			}

			openOverview(ov);
		}
	}

	return {
		todo,
		project,
		updateActive,
		updateSidebar,
	};
})();
