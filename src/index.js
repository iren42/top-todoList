import "./css/normalize.css";
import "./css/style.css";
import { project } from "./js/Project.js";
import { CONTENTEDITABLE, DOMCreator } from "./js/DOMCreator.js";
import * as ERROR from "./js/error_constants.js";

if (process.env.NODE_ENV !== "production") {
	console.log("Looks like we are in development mode!");
}

{
	const sidebar = document.querySelector(".sidebar");
	const arrowCollapse = document.querySelector("#collapse-sidebar-icon");
	if (arrowCollapse && sidebar) {
		arrowCollapse.addEventListener("click", () => {
			sidebar.classList.toggle("collapse");
			arrowCollapse.classList.toggle("collapse");
			arrowCollapse.classList = arrowCollapse.classList.contains(
				"collapse",
			)
				? "fi fi-rr-angle-right collapse"
				: "fi fi-rr-angle-left";
		});
	}
}

{
	function findParentElementByClass(element, className) {
		if (!(element instanceof HTMLElement)) {
			throw new TypeError(`Not a HTMLElement ${element}`);
		}

		if (!element.classList.contains(className)) {
			while (!element.classList.contains(className)) {
				element = element.parentElement;
			}
		}

		return element;
	}

	function removeBR(string_) {
		if (!string_.endsWith("\n")) {
			return string_;
		}

		return string_.slice(0, -1);
	}

	function renameProject(eventTarget) {
		const IDElement = findParentElementByClass(eventTarget, "project");
		if (!IDElement) {
			throw new Error(ERROR.CLASS("project"));
		}

		const textElement = IDElement.querySelector(".project-text");
		if (!textElement) {
			throw new Error(ERROR.CLASS("project-text"));
		}

		project.rename(IDElement.id, textElement.innerText);
		eventTarget.contentEditable = false;
	}

	function removeActiveClasses() {
		const list = document.querySelectorAll(".active");
		if (!list) {
			return;
		}

		for (const element of list) {
			element.classList.remove("active");
		}
	}

	const projectListDiv = document.querySelector("ul.projectList");
	projectListDiv.addEventListener("focusout", (event) => {
		try {
			if (event.target.closest(".project-text")) {
				renameProject(event.target);
				DOMCreator.updateActive();
			}
		} catch (error) {
			console.error(error);
		}
	});

	projectListDiv.addEventListener("keydown", (event) => {
		try {
			if (
				event.key === "Enter" &&
				event.target.closest(".project-text")
			) {
				event.preventDefault();
				renameProject(event.target);
				DOMCreator.updateActive();
			}
		} catch (error) {
			console.error(error);
		}
	});

	const todoListDiv = document.querySelector(".todoList");
	todoListDiv.addEventListener("change", (event) => {
		try {
			if (event.target.closest("input[type='checkbox']")) {
				if (!(event.target instanceof HTMLInputElement)) {
					return;
				}

				if (!event.target.id) {
					throw new Error(ERROR.ID(event.target));
				}

				const IDElement = findParentElementByClass(
					event.target,
					"todo",
				);
				if (!IDElement) {
					throw new Error(ERROR.CLASS("todo"));
				}

				if (!IDElement.id) {
					throw new Error(ERROR.ID(IDElement));
				}

				console.log(
					"change state of checkbox to " + event.target.checked,
				);

				const todoObject = project.get(IDElement.id);
				if (!todoObject) {
					throw new Error(ERROR.KEY(IDElement.id));
				}

				project.toggleCheckbox(todoObject, event.target);

				DOMCreator.updateActive();
			}
		} catch (error) {
			console.error(error);
		}
	});

	todoListDiv.addEventListener("submit", (event) => {
		try {
			event.preventDefault();
			if (!event.target.id) {
				throw new Error(ERROR.ID(event.target));
			}

			const todoObject = project.get(event.target.id);
			if (!todoObject) {
				throw new Error(ERROR.KEY(event.target.id));
			}

			console.log("save todo");

			const formData = new FormData(event.target);
			project.updateFromTodoToProject(todoObject, formData);

			DOMCreator.updateActive();
		} catch (error) {
			console.error(error);
		}
	});

	document.addEventListener("click", (event) => {
		try {
			if (event.target.closest(".delete-todo")) {
				const IDElement = findParentElementByClass(
					event.target,
					"todo",
				);
				if (!IDElement) {
					throw new Error(ERROR.CLASS("todo"));
				}

				if (!IDElement.id) {
					throw new Error(ERROR.ID(IDElement));
				}

				const projectID = IDElement.dataset.projectid;
				if (!projectID) {
					throw new Error("No dataset projectid");
				}

				project.remove(IDElement.id);
				DOMCreator.updateActive();
			} else if (event.target.closest(".expand-todo")) {
				const button = findParentElementByClass(event.target, "fi");
				const IDElement = findParentElementByClass(
					event.target,
					"todo",
				);
				if (!IDElement) {
					throw new Error(ERROR.CLASS("todo"));
				}

				IDElement.classList.toggle("collapse");
				button.classList = IDElement.classList.contains("collapse")
					? "fi fi-tr-square-plus"
					: "fi fi-tr-square-minus";
			} else if (event.target.closest(".delete-project")) {
				const IDElement = findParentElementByClass(
					event.target,
					"project",
				);
				if (!IDElement) {
					throw new Error(ERROR.CLASS("project"));
				}

				if (!IDElement.id) {
					throw new Error(ERROR.ID(IDElement));
				}

				console.log("delete project");
				project.remove(IDElement.id);
				DOMCreator.updateSidebar();
				DOMCreator.updateActive();
			} else if (event.target.closest("#emptyTrash")) {
				console.log("empty trash");
				project.removeTrash();
				DOMCreator.updateActive();
			} else if (event.target.closest(".rename-project")) {
				const IDElement = findParentElementByClass(
					event.target,
					"project",
				);
				if (!IDElement) {
					throw new Error(ERROR.CLASS("project"));
				}

				const textElement = IDElement.querySelector(".project-text");
				if (!textElement) {
					throw new Error(ERROR.CLASS("project-text"));
				}

				textElement.contentEditable = CONTENTEDITABLE;
				textElement.focus();
			} else if (event.target.closest("#addNewProject")) {
				console.log("add a new project");
				const newProject = project.create();
				DOMCreator.updateSidebar();

				removeActiveClasses();

				const projectElement = document.querySelector(
					`#${CSS.escape(newProject.id)}`,
				);
				projectElement.classList.add("active");
				DOMCreator.updateActive();
			} else if (event.target.closest("#clearBtn")) {
				console.log("clear all data");
				project.clearAll();
				DOMCreator.updateSidebar();
				DOMCreator.updateActive();
			} else if (event.target.closest("#saveBtn")) {
				console.log("save project");
				const IDElement = document.querySelector(".project.active");
				if (!IDElement) {
					throw new Error(ERROR.CLASS("project active"));
				}

				if (!IDElement.id) {
					throw new Error(ERROR.ID(IDElement));
				}

				// Edited div with contentEditable adds a newline even if its content is empty
				const editor = document.querySelector(".editor");
				if (!editor) {
					throw new Error("No editor");
				}

				const editorText = removeBR(editor.innerText);

				const projectObject = project.get(IDElement.id);
				if (!projectObject) {
					throw new Error(ERROR.KEY(IDElement.id));
				}

				project.update(projectObject, { content: editorText });
				project.updateTodoList(projectObject);

				DOMCreator.updateActive();
			} else if (event.target.closest(".overview")) {
				const IDElement = findParentElementByClass(
					event.target,
					"overview",
				);
				if (!IDElement) {
					throw new Error(ERROR.CLASS("overview"));
				}

				if (!IDElement.id) {
					throw new Error(ERROR.ID(IDElement));
				}

				// Only one 'active' HTMLelement
				removeActiveClasses();
				IDElement.classList.add("active");

				DOMCreator.updateActive();
			} else if (event.target.closest(".project")) {
				const IDElement = findParentElementByClass(
					event.target,
					"project",
				);
				if (!IDElement) {
					throw new Error(ERROR.CLASS("project"));
				}

				if (!IDElement.id) {
					throw new Error(ERROR.ID(IDElement));
				}

				// Only one 'active' HTMLelement
				removeActiveClasses();
				IDElement.classList.add("active");

				DOMCreator.updateActive();
			} else;
		} catch (error) {
			console.error(error);
		}
	});

	DOMCreator.updateSidebar();
	DOMCreator.updateActive();
}
