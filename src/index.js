import "./css/normalize.css";
import "./css/style.css";

import { isBefore, isAfter, isToday, addDays, subDays } from "date-fns";
import { project } from "./js/Project.js"
import { DOMCreator } from "./js/DOMCreator.js";
import { TODO_TYPE } from "./js/Todo.js";
import * as ERROR from "./js/error_constants.js";
import * as Storage from "./js/storage.js";

if (process.env.NODE_ENV !== 'production') {
	console.log('Looks like we are in development mode!');
}
{
	let sidebar = document.querySelector('.sidebar');
	let arrowCollapse = document.querySelector('#collapse-sidebar-icon');
	if (arrowCollapse && sidebar) {
		arrowCollapse.onclick = () => {
			sidebar.classList.toggle('collapse');
			arrowCollapse.classList.toggle('collapse');
			if (arrowCollapse.classList.contains('collapse')) {
				arrowCollapse.classList = "fi fi-rr-angle-right collapse";
			}
			else {
				arrowCollapse.classList = "fi fi-rr-angle-left";
			}
		};
	}
}

{
	const todoListDiv = document.querySelector(".todoList");

	const overviewToday = {
		id: "todo-today", // needs to be the same as the ID in template.html
		fn: isToday
	};

	const overviewSeven = {
		id: "todo-seven",
		fn: isNextSevenDays
	}

	const overviewAll = {
		id: "todo-all",
		fn: () => 1
	}

	const overviewList = [overviewToday, overviewSeven, overviewAll];

	function clearAll() {
		const leftDiv = document.querySelector(".left");
		leftDiv.innerHTML = "";
		todoListDiv.innerHTML = "";
	}

	function removeActiveClasses() {
		const list = document.querySelectorAll(".active");
		if (!list)
			return;
		for (let i = 0; i < list.length; i++) {
			list[i].classList.remove("active");
		}
	}

	function findParentElByClass(element, className) {
		if (!(element instanceof HTMLElement))
			throw new Error(`Not a HTMLElement ${element}`);
		if (!element.classList.contains(className)) {
			while (!element.classList.contains(className)) {
				element = element.parentElement;
			}
		}
		return (element);
	}

	function isNextSevenDays(date) {
		return (isAfter(date, subDays(new Date(), 1)) &&
			isBefore(date, addDays(new Date(), 6)));
	}

	function createTodoFNList(fnDateInterval) {
		const todoArr = [];

		for (let i = 0; i < Storage.getLength(); i++) {
			const key = Storage.key(i);
			const stored = project.get(key);
			if (!stored)
				continue;
			if (stored.type !== TODO_TYPE)
				continue;
			if (fnDateInterval(stored.dueDate))
				todoArr.push(stored);
		}
		return (todoArr);
	}

	function createArrayOfSortedTodos(projectID) {
		const todoArray = [];
		for (let i = 0; i < Storage.getLength(); i++) {
			const key = Storage.key(i);
			const stored = project.get(key);
			if (!stored)
				continue;
			if (stored.type !== TODO_TYPE)
				continue;
			if (stored.projectID !== projectID)
				continue;
			todoArray.push(stored);
		}
		todoArray.sort((a, b) => a.lineNumber - b.lineNumber)
		return (todoArray);
	}


	function openProject(projectObj) {
		clearAll();
		const IDElement = document.querySelector(`#${CSS.escape(projectObj.id)}`);

		// only one 'active' HTMLelement
		removeActiveClasses();
		IDElement.classList.add("active");

		DOMCreator.updateEditor(projectObj.id);

		const todoArr = createArrayOfSortedTodos(projectObj.id);
		DOMCreator.updateTodoList(todoArr);
	}

	function removeBR(str) {
		if (!str.endsWith("\n"))
			return (str);
		return (str.slice(0, str.length - 1));
	}

	function renameProject(eventTarget) {
		let IDElement = findParentElByClass(eventTarget, "project");
		if (!IDElement)
			throw new Error(ERROR.CLASS("project"));
		let textEl = IDElement.querySelector(".project-text");
		if (!textEl)
			throw new Error(ERROR.CLASS("project-text"));

		project.rename(IDElement.id, textEl.innerText);
		eventTarget.contentEditable = false;
	}

	const projectListDiv = document.querySelector("ul.projectList");
	projectListDiv.addEventListener("focusout", event => {
		try {
			if (event.target.closest(".project-text")) {
				renameProject(event.target);
			}
		} catch (error) {
			console.error(error);
		}
	})

	projectListDiv.addEventListener("keydown", event => {
		try {
			if (event.key === "Enter" && event.target.closest(".project-text")) {
				event.preventDefault();
				renameProject(event.target);
			}
		} catch (error) {
			console.error(error);
		}
	})

	todoListDiv.addEventListener("change", event => {
		try {
			if (event.target.closest("input[type='checkbox']")) {
				if (!(event.target instanceof HTMLInputElement))
					return;
				if (!event.target.id)
					throw new Error(ERROR.ID(event.target));
				let IDElement = findParentElByClass(event.target, "todo");
				if (!IDElement)
					throw new Error(ERROR.CLASS("todo"));
				if (!IDElement.id)
					throw new Error(ERROR.ID(IDElement));

				const todoObj = project.get(IDElement.id);
				if (!todoObj)
					throw new Error(ERROR.KEY(IDElement.id));

				project.toggleCheckbox(todoObj, event.target);

				const active = document.querySelector(".active");
				if (active.classList.contains("project"))
					DOMCreator.updateEditor(todoObj.projectID);

				console.log("change state of checkbox to " + event.target.checked);
			}
		} catch (error) {
			console.error(error);
		}
	})

	todoListDiv.addEventListener("submit", event => {
		try {
			event.preventDefault();
			console.log("save todo");
			if (!event.target.id)
				throw new Error(ERROR.ID(event.target));

			const todoObj = project.get(event.target.id);
			if (!todoObj)
				throw new Error(ERROR.KEY(event.target.id));

			const formData = new FormData(event.target);
			project.updateFromTodoToProject(todoObj, formData);

			// update DOM
			const active = document.querySelector(".active");
			if (!active)
				throw new Error(ERROR.CLASS("active"));

			if (active.classList.contains("project")) {
				const projectObj = project.get(todoObj.projectID);
				openProject(projectObj);
			}
			else {
				const ov = overviewList.find(element => element.id === active.id);
				if (!ov)
					throw new Error(ERROR.ID(active.id));
				openOverview(ov);
			}
		} catch (error) {
			console.error(error);
		}
	})

	function sortDates(a, b) {
		if (!a.dueDate)
			return (1);
		if (!b.dueDate)
			return (-1);
		if (isAfter(a.dueDate, b.dueDate))
			return (1);
		if (a.dueDate === b.dueDate) {
			if (!a.dueTime)
				return (1);
			if (!b.dueTime)
				return (-1);
			if (a.dueTime >  b.dueTime)
				return (1);
			if (a.dueTime === b.dueTime)
				return (0);
		}
		return (-1);
	}

	function openOverview(overviewObj) {
		clearAll();
		const IDElement = document.querySelector(`#${CSS.escape(overviewObj.id)}`);
		removeActiveClasses();
		IDElement.classList.add("active");

		const todoArr = createTodoFNList(overviewObj.fn);
		todoArr.sort(sortDates);
		DOMCreator.updateTodoList(todoArr);
	}

	document.addEventListener("click", event => {
		try {
			if (event.target.closest(".overview")) {
				let IDElement = findParentElByClass(event.target, "overview");
				if (!IDElement)
					throw new Error(ERROR.CLASS("overview"));

				const ov = overviewList.find(element => element.id === IDElement.id);
				if (!ov)
					throw new Error(ERROR.ID(IDElement.id));
				openOverview(ov);
			}
			else if (event.target.closest(".delete-todo")) {
				let IDElement = findParentElByClass(event.target, "todo");
				if (!IDElement)
					throw new Error(ERROR.CLASS("todo"));
				if (!IDElement.id)
					throw new Error(ERROR.ID(IDElement));
				const projectID = IDElement.dataset.projectid;
				if (!projectID)
					throw new Error(`No dataset projectid`);

				project.remove(IDElement.id);
				const todoArr = createArrayOfSortedTodos(projectID);
				DOMCreator.updateTodoList(todoArr);
			}
			else if (event.target.closest(".expand-todo")) {
				let IDElement = findParentElByClass(event.target, "todo");
				if (!IDElement)
					throw new Error(ERROR.CLASS("todo"));

				IDElement.classList.toggle('collapse');
			}
			else if (event.target.closest(".delete-project")) {
				let IDElement = findParentElByClass(event.target, "project");
				if (!IDElement)
					throw new Error(ERROR.CLASS("project"));
				if (!IDElement.id)
					throw new Error(ERROR.ID(IDElement));

				project.remove(IDElement.id);
				clearAll();
				DOMCreator.updateSidebar();
			}
			else if (event.target.closest(".rename-project")) {
				let IDElement = findParentElByClass(event.target, "project");
				if (!IDElement)
					throw new Error(ERROR.CLASS("project"));
				let textEl = IDElement.querySelector(".project-text");
				if (!textEl)
					throw new Error(ERROR.CLASS("project-text"));

				textEl.contentEditable = CONTENTEDITABLE;
				textEl.focus();
			}
			else if (event.target.closest("#addNewProject")) {
				console.log("add a new project");
				const newProject = project.create();
				DOMCreator.updateSidebar();
				openProject(newProject);
			}
			else if (event.target.closest("#clearBtn")) {
				console.log("clear data");
				clearAll();
				project.clearAll();
				DOMCreator.updateSidebar();
			}
			else if (event.target.closest("#saveBtn")) {
				console.log("saving");
				const IDElement = document.querySelector(".project.active");
				if (!IDElement)
					throw new Error(ERROR.CLASS("project active"));
				if (!IDElement.id)
					throw new Error(ERROR.ID(IDElement));

				// edited div with contentEditable adds a newline even if its content is empty
				const editor = document.querySelector(".editor");
				if (!editor)
					throw new Error("No editor");
				let editorText = removeBR(editor.innerText);

				const projectObj = project.get(IDElement.id);
				if (!projectObj)
					throw new Error(ERROR.KEY(IDElement.id));

				project.update(projectObj, { content: editorText });
				project.updateTodoList(projectObj);

				const todoArr = createArrayOfSortedTodos(projectObj.id);
				DOMCreator.updateTodoList(todoArr);
			}
			else if (event.target.closest("button.project")) {
				let IDElement = findParentElByClass(event.target, "project");
				if (!IDElement)
					throw new Error(ERROR.CLASS("project"));
				if (!IDElement.id)
					throw new Error(ERROR.ID(IDElement));

				const projectObj = project.get(IDElement.id);
				if (!projectObj)
					throw new Error(ERROR.KEY(IDElement.id));
				openProject(projectObj);
			}
			else;
		} catch (error) {
			console.error(error);
		}
	});

	DOMCreator.updateSidebar();
	openOverview(overviewToday);
}
