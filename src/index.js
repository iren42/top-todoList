import "./css/normalize.css";
import "./css/style.css";

import { isBefore, isAfter, isToday, addDays, subDays } from "date-fns";
import { project } from "./js/Project.js"
import { DOMCreator } from "./js/DOMCreator.js";
import { TODO_TYPE } from "./js/Todo.js";
import * as ERROR from "./js/error_constants.js";

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
	const editor = document.querySelector(".editor");
	const preview = document.querySelector(".todoView");
	const CONTENTEDITABLE = "plaintext-only";

	function clearAll() {
		editor.contentEditable = false;
		editor.innerHTML = "";
		preview.innerHTML = "";
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

	function createTodoFNList(database, fnDateInterval) {
		const todoArr = [];

		for (let i = 0; i < database.length; i++) {
			const key = database.key(i);
			const stored = project.get(database, key);
			if (!stored)
				continue;
			if (stored.type !== TODO_TYPE)
				continue;
			if (fnDateInterval(stored.dueDate))
				todoArr.push(stored);
		}
		return (todoArr);
	}

	function createArrayOfSortedTodos(database, projectID) {
		const todoArray = [];
		for (let i = 0; i < database.length; i++) {
			const key = database.key(i);
			const stored = project.get(database, key);
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

		editor.contentEditable = CONTENTEDITABLE;
		DOMCreator.updateEditor(localStorage, projectObj.id);

		const todoArr = createArrayOfSortedTodos(localStorage, projectObj.id);
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

		project.rename(localStorage, IDElement.id, textEl.innerText);
		eventTarget.contentEditable = false;
	}

	const projectListDiv = document.querySelector("ul.projectList");
	projectListDiv.addEventListener("focusout", event => {
		if (event.target.closest(".project-text")) {
			renameProject(event.target);
		}
	})

	projectListDiv.addEventListener("keydown", event => {
		if (event.key === "Enter" && event.target.closest(".project-text")) {
			event.preventDefault();
			renameProject(event.target);
		}
	})

	preview.addEventListener("change", event => {
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

			const todoObj = project.get(localStorage, IDElement.id);
			if (!todoObj)
				throw new Error(ERROR.KEY(IDElement.id));

			const buf = {
				isChecked: "off"
			};
			if (event.target.checked)
				buf.isChecked = "on";

			project.updateTodo(localStorage, todoObj, buf);

			// update Project obj with Todo obj
			const updatedTodo = project.get(localStorage, todoObj.id);
			const projectObj = project.get(localStorage, todoObj.projectID);
			project.update(localStorage, projectObj, updatedTodo);

			DOMCreator.updateEditor(localStorage, projectObj.id);

			console.log("change state of checkbox to " + event.target.checked);
		}
	})

	preview.addEventListener("submit", event => {
		event.preventDefault();
		if (!event.target.id)
			throw new Error(ERROR.ID(event.target));

		const todoObj = project.get(localStorage, event.target.id);
		if (!todoObj)
			throw new Error(ERROR.KEY(event.target.id));

		// update Todo obj
		const formData = new FormData(event.target);
		project.updateTodo(localStorage, todoObj, Object.fromEntries(formData));

		// update Project obj with Todo obj
		const updatedTodo = project.get(localStorage, todoObj.id);
		const projectObj = project.get(localStorage, updatedTodo.projectID);
		project.update(localStorage, projectObj, updatedTodo);

		// update DOM
		const todoArr = createArrayOfSortedTodos(localStorage, updatedTodo.projectID);
		DOMCreator.updateTodoList(todoArr);
		DOMCreator.updateEditor(localStorage, projectObj.id);
		console.log("save todo");
	})

	function openOverview(element, fnDateInterval) {
		let IDElement = findParentElByClass(element, "overview");
		if (!IDElement)
			throw new Error(ERROR.CLASS("overview"));
		clearAll();
		removeActiveClasses();
		IDElement.classList.add("active");

		const todoArr = createTodoFNList(localStorage, fnDateInterval);
		DOMCreator.updateTodoList(todoArr);
	}

	document.addEventListener("click", event => {
		if (event.target.closest("#todo-all")) {
			openOverview(event.target, () => 1);
		}
		else if (event.target.closest("#todo-seven")) {
			openOverview(event.target, isNextSevenDays);
		}
		else if (event.target.closest("#todo-today")) {
			openOverview(event.target, isToday);
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

			project.remove(localStorage, IDElement.id);
			const todoArr = createArrayOfSortedTodos(localStorage, projectID);
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

			project.remove(localStorage, IDElement.id);
			clearAll();
			DOMCreator.updateSidebar(localStorage);
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
			const newProject = project.create(localStorage);
			DOMCreator.updateSidebar(localStorage);
			openProject(newProject);
		}
		else if (event.target.closest("#clearBtn")) {
			console.log("clear data");
			clearAll();
			project.clearAll(localStorage);
			DOMCreator.updateSidebar(localStorage);
		}
		else if (event.target.closest("#saveBtn")) {
			console.log("saving");
			const IDElement = document.querySelector(".project.active");
			if (!IDElement)
				throw new Error(ERROR.CLASS("project active"));
			if (!IDElement.id)
				throw new Error(ERROR.ID(IDElement));

			// edited div with contentEditable adds a newline even if its content is empty
			let editorText = removeBR(editor.innerText);

			const projectObj = project.get(localStorage, IDElement.id);
			if (!projectObj)
				throw new Error(ERROR.KEY(IDElement.id));
			project.update(localStorage, projectObj, { content: editorText });
			project.updateTodoList(localStorage, projectObj);
			const todoArr = createArrayOfSortedTodos(localStorage, projectObj.id);
			DOMCreator.updateTodoList(todoArr);
		}
		else if (event.target.closest("button.project")) {
			let IDElement = findParentElByClass(event.target, "project");
			if (!IDElement)
				throw new Error(ERROR.CLASS("project"));
			if (!IDElement.id)
				throw new Error(ERROR.ID(IDElement));

			const projectObj = project.get(localStorage, IDElement.id);
			if (!projectObj)
				throw new Error(ERROR.KEY(IDElement.id));
			openProject(projectObj);
		}
		else;
	});

	DOMCreator.updateSidebar(localStorage);
	const todayArr = createTodoFNList(localStorage, isToday);
	DOMCreator.updateTodoList(todayArr);
}
