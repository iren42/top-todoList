import "./css/normalize.css";
import "./css/style.css";

import { project } from "./js/Project.js"
import { CONTENTEDITABLE, DOMCreator } from "./js/DOMCreator.js";
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

	function removeActiveClasses() {
		const list = document.querySelectorAll(".active");
		if (!list)
			return;
		for (let i = 0; i < list.length; i++) {
			list[i].classList.remove("active");
		}
	}

	const projectListDiv = document.querySelector("ul.projectList");
	projectListDiv.addEventListener("focusout", event => {
		try {
			if (event.target.closest(".project-text")) {
				renameProject(event.target);
				DOMCreator.updateActive();
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
				DOMCreator.updateActive();
			}
		} catch (error) {
			console.error(error);
		}
	})

	const todoListDiv = document.querySelector(".todoList");
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
				console.log("change state of checkbox to " + event.target.checked);

				const todoObj = project.get(IDElement.id);
				if (!todoObj)
					throw new Error(ERROR.KEY(IDElement.id));

				project.toggleCheckbox(todoObj, event.target);

				DOMCreator.updateActive();
			}
		} catch (error) {
			console.error(error);
		}
	})

	todoListDiv.addEventListener("submit", event => {
		try {
			event.preventDefault();
			if (!event.target.id)
				throw new Error(ERROR.ID(event.target));

			const todoObj = project.get(event.target.id);
			if (!todoObj)
				throw new Error(ERROR.KEY(event.target.id));
			console.log("save todo");

			const formData = new FormData(event.target);
			project.updateFromTodoToProject(todoObj, formData);

			DOMCreator.updateActive();
		} catch (error) {
			console.error(error);
		}
	})

	document.addEventListener("click", event => {
		try {
			if (event.target.closest(".delete-todo")) {
				let IDElement = findParentElByClass(event.target, "todo");
				if (!IDElement)
					throw new Error(ERROR.CLASS("todo"));
				if (!IDElement.id)
					throw new Error(ERROR.ID(IDElement));
				const projectID = IDElement.dataset.projectid;
				if (!projectID)
					throw new Error(`No dataset projectid`);

				project.remove(IDElement.id);
				DOMCreator.updateActive();
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

				console.log("delete project");
				project.remove(IDElement.id);
				DOMCreator.updateSidebar();
				DOMCreator.updateActive();
			}
			else if (event.target.closest(".rename-project")) {
				console.log("here");
				let IDElement = findParentElByClass(event.target, "project");
				if (!IDElement)
					throw new Error(ERROR.CLASS("project"));
				let textEl = IDElement.querySelector(".project-text");
				if (!textEl)
					throw new Error(ERROR.CLASS("project-text"));

				console.log("here");
				textEl.contentEditable = CONTENTEDITABLE;
				textEl.focus();
			}
			else if (event.target.closest("#addNewProject")) {
				console.log("add a new project");
				const newProject = project.create();
				DOMCreator.updateSidebar();

				removeActiveClasses();

				const projectEl = document.querySelector(`#${CSS.escape(newProject.id)}`);
				projectEl.classList.add("active");
				DOMCreator.updateActive();
			}
			else if (event.target.closest("#clearBtn")) {
				console.log("clear all data");
				project.clearAll();
				DOMCreator.updateSidebar();
				DOMCreator.updateActive();
			}
			else if (event.target.closest("#saveBtn")) {
				console.log("save project");
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

				DOMCreator.updateActive();
			}
			else if (event.target.closest(".overview")) {
				let IDElement = findParentElByClass(event.target, "overview");
				if (!IDElement)
					throw new Error(ERROR.CLASS("overview"));
				if (!IDElement.id)
					throw new Error(ERROR.ID(IDElement));

				// only one 'active' HTMLelement
				removeActiveClasses();
				IDElement.classList.add("active");

				DOMCreator.updateActive();
			}
			else if (event.target.closest(".project")) {
				let IDElement = findParentElByClass(event.target, "project");
				if (!IDElement)
					throw new Error(ERROR.CLASS("project"));
				if (!IDElement.id)
					throw new Error(ERROR.ID(IDElement));

				console.log("project");
				// only one 'active' HTMLelement
				removeActiveClasses();
				IDElement.classList.add("active");

				DOMCreator.updateActive();
			}
			else;
		} catch (error) {
			console.error(error);
		}
	});

	DOMCreator.updateSidebar();
	DOMCreator.updateActive();
}
