import "./css/normalize.css";
import "./css/style.css";

import { projectController } from "./js/Project.js"
import { DOMCreator } from "./js/DOMCreator.js";
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

const DOMController = (function() {
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

	function openProject(projectObj) {
		clearAll();
		const IDElement = document.querySelector(`#${CSS.escape(projectObj.id)}`);

		// only one 'active' HTMLelement
		removeActiveClasses();
		IDElement.classList.add("active");

		editor.contentEditable = CONTENTEDITABLE;
		DOMCreator.updateEditor(localStorage, projectObj.id);

		const todoArr = DOMCreator.createArrayOfSortedTodos(localStorage, projectObj.id);
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

		projectController.rename(localStorage, IDElement.id, textEl.innerText);
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

			const todoObj = projectController.get(localStorage, IDElement.id);
			if (!todoObj)
				throw new Error(ERROR.KEY(IDElement.id));

			const buf = {
				isChecked: "off"
			};
			if (event.target.checked)
				buf.isChecked = "on";

			projectController.updateTodo(localStorage, todoObj, buf);

			const updatedTodo = projectController.get(localStorage, todoObj.id);

			const projectObj = projectController.get(localStorage, todoObj.projectID);
			projectController.update(localStorage,  projectObj, updatedTodo);
			DOMCreator.updateEditor(localStorage, projectObj.id);

			console.log("change state of checkbox to " + event.target.checked);
		}
	})

	preview.addEventListener("submit", event => {
		event.preventDefault();
		if (!event.target.id)
			throw new Error(ERROR.ID(event.target));

		const todoObj = projectController.get(localStorage, event.target.id);
		if (!todoObj)
			throw new Error(ERROR.KEY(event.target.id));
		const formData = new FormData(event.target);
		console.log(Object.fromEntries(formData));
		projectController.updateTodo(localStorage, todoObj, Object.fromEntries(formData));

		const updatedTodo = projectController.get(localStorage, todoObj.id);

		const projectObj = projectController.get(localStorage, updatedTodo.projectID);
		projectController.update(localStorage,  projectObj, updatedTodo);
		const todoArr = DOMCreator.createArrayOfSortedTodos(localStorage, updatedTodo.projectID);
		DOMCreator.updateTodoList(todoArr);
		DOMCreator.updateEditor(localStorage, projectObj.id);
		console.log("save todo");
	})

	document.addEventListener("click", event => {
		if (event.target.closest("#todo-all")) {
			let IDElement = findParentElByClass(event.target, "overview");
			if (!IDElement)
				throw new Error(ERROR.CLASS("overview"));
			clearAll();
			removeActiveClasses();
			IDElement.classList.add("active");

			const todoArr = DOMCreator.createTodoFNList(localStorage, () => 1);
			DOMCreator.updateTodoList(todoArr);
		}
		if (event.target.closest("#todo-seven")) {
			let IDElement = findParentElByClass(event.target, "overview");
			if (!IDElement)
				throw new Error(ERROR.CLASS("overview"));
			clearAll();
			removeActiveClasses();
			IDElement.classList.add("active");

			const todoArr = DOMCreator.createTodoFNList(localStorage, DOMCreator.isNextSevenDays);
			DOMCreator.updateTodoList(todoArr);
		}
		else if (event.target.closest("#todo-today")) {
			let IDElement = findParentElByClass(event.target, "overview");
			if (!IDElement)
				throw new Error(ERROR.CLASS("overview"));
			clearAll();
			removeActiveClasses();
			IDElement.classList.add("active");

			const todayArr = DOMCreator.createTodoFNList(localStorage, DOMCreator.isToday);
			DOMCreator.updateTodoList(todayArr);
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

			projectController.remove(localStorage, IDElement.id);
			const todoArr = DOMCreator.createArrayOfSortedTodos(localStorage, projectID);
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

			projectController.remove(localStorage, IDElement.id);
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
			const newProject = projectController.create(localStorage);
			DOMCreator.updateSidebar(localStorage);
			openProject(newProject);
		}
		else if (event.target.closest("#clearBtn")) {
			console.log("clear data");
			clearAll();
			projectController.clearAll(localStorage);
			DOMCreator.updateSidebar(localStorage);
		}
		else if (event.target.closest("#saveBtn")) {
			console.log("saving");
			const IDElement = document.querySelector(".project.active");
			if (!IDElement)
				throw new Error(ERROR.CLASS("project active"));
			if (!IDElement.id)
				throw new Error(ERROR.ID(IDElement.id));

			// edited div with contentEditable adds a newline even if its content is empty
			let editorText = removeBR(editor.innerText);

			const projectObj = projectController.get(localStorage, IDElement.id);
			if (!projectObj)
				throw new Error(ERROR.KEY(IDElement.id));
			projectController.update(localStorage, projectObj, { content: editorText });
			projectController.updateTodoList(localStorage, projectObj);
			const todoArr = DOMCreator.createArrayOfSortedTodos(localStorage, projectObj.id);
			DOMCreator.updateTodoList(todoArr);
		}
		else if (event.target.closest("button.project")) {
			let IDElement = findParentElByClass(event.target, "project");
			if (!IDElement)
				throw new Error(ERROR.CLASS("project"));
			if (!IDElement.id)
				throw new Error(ERROR.ID(IDElement.id));

			const projectObj = projectController.get(localStorage, IDElement.id);
			if (!projectObj)
				throw new Error(ERROR.KEY(IDElement.id));
			openProject(projectObj);
		}
		else;
	});

	DOMCreator.updateSidebar(localStorage);
	const todayArr = DOMCreator.createTodoFNList(localStorage, DOMCreator.isToday);
	DOMCreator.updateTodoList(todayArr);

	return ({
	})
})();
