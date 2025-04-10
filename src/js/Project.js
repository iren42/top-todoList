import {
	TODO_PREFIX,
	TODO_TYPE,
	TODO_PREFIX_DONE,
	todoController,
	TODO_SEPARATOR,
} from "./Todo.js";
import * as Storage from "./storage.js";
import * as ERROR from "./error_constants.js";
import { isTrash } from "./overview.js";

export const PROJECT_TYPE = "PROJECT";

function Project(name = "New project", creationDate = new Date()) {
	this.id = uid();
	this.name = name;
	this.content = "";
	this.lastEditDate = creationDate;
	this.creationDate = creationDate;
	this.type = PROJECT_TYPE;
}

function uid() {
	return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function isTodo(string_) {
	if (!(typeof string_ === "string")) {
		return false;
	}

	if (
		string_.indexOf(TODO_PREFIX) !== 0 &&
		string_.indexOf(TODO_PREFIX_DONE) !== 0
	) {
		return false;
	}

	return true;
}

export const project = (function () {
	function updateFromTodoToProject(todoObject, formData) {
		// Update Todo obj
		updateTodo(todoObject, Object.fromEntries(formData));

		// Update Project obj with Todo obj
		const updatedTodo = get(todoObject.id);
		const projectObject = get(updatedTodo.projectID);
		update(projectObject, updatedTodo);
	}

	function toggleCheckbox(todoObject, element) {
		const buf = {
			isChecked: "off",
		};
		if (element.checked) {
			buf.isChecked = "on";
		}

		updateTodo(todoObject, buf);

		// Update Project obj with Todo obj
		const updatedTodo = get(todoObject.id);
		const projectObject = get(todoObject.projectID);
		update(projectObject, updatedTodo);
	}

	function removeTodoSurplus(projectObject, limit) {
		const length = Storage.getLength();
		const keysToRemove = [];
		for (let i = 0; i < length; i++) {
			const key = Storage.key(i);
			const stored = Storage.getItem(key);
			if (!stored) {
				throw new Error(ERROR.KEY(key));
			}

			if (stored.type === PROJECT_TYPE) {
				continue;
			}

			if (stored.projectID !== projectObject.id) {
				continue;
			}

			const index = stored.id.indexOf(TODO_SEPARATOR);
			const number_ = stored.id.slice(0, Math.max(0, index));
			if (Number(number_) < limit) {
				continue;
			}

			keysToRemove.push(key);
		}

		keysToRemove.map((key) => Storage.removeItem(key));
	}

	function updateTodoList(projectObject) {
		const lines = projectObject.content.split("\n");
		removeTodoSurplus(projectObject, lines.length);
		for (const [i, line] of lines.entries()) {
			const title = line.slice(TODO_PREFIX.length);
			const key = todoController.getKey(i, projectObject.id);
			const hasX = !line.indexOf(TODO_PREFIX_DONE);
			let isChecked = "off";
			if (hasX) {
				isChecked = "on";
			}

			const buf = {
				title,
				isChecked,
			};

			if (!isTodo(line)) {
				Storage.removeItem(key);
				continue;
			}

			const todo = Storage.getItem(key);
			if (todo) {
				todoController.update(todo, buf);
			} else {
				todoController.create(projectObject.id, i, buf);
			}
		}
	}

	function create() {
		const newProject = new Project();
		Storage.setItem(newProject.id, newProject);
		return newProject;
	}

	// 'delete' is a reserved word
	// don't call Storage.removeItem() while in a loop over Storage items
	// it produces a bug
	function remove(key) {
		const projectObject = Storage.getItem(key);
		if (!projectObject) {
			throw new Error(ERROR.KEY(key));
		}

		const length = Storage.getLength();
		const keysToRemove = [];
		for (let i = 0; i < length; i++) {
			const todoKey = Storage.key(i);
			const stored = Storage.getItem(todoKey);
			if (!stored) {
				throw new Error(ERROR.KEY(todoKey));
			}

			if (stored.type !== TODO_TYPE) {
				continue;
			}

			if (stored.projectID !== projectObject.id) {
				continue;
			}

			keysToRemove.push(todoKey);
		}

		keysToRemove.push(key);
		keysToRemove.map((key) => Storage.removeItem(key));
	}

	function updateContentWithTodo(target, source) {
		const lines = target.content.split("\n");
		const regex = new RegExp(`(?<=^.{${TODO_PREFIX.length}}).*`);
		let newLine;

		newLine =
			source.isChecked === "on"
				? lines[source.lineNumber].replace(
						TODO_PREFIX,
						TODO_PREFIX_DONE,
					)
				: lines[source.lineNumber].replace(
						TODO_PREFIX_DONE,
						TODO_PREFIX,
					);
		newLine = newLine.replace(regex, source.title);
		lines.splice(source.lineNumber, 1, newLine);
		target.content = lines.join("\n");
	}

	function update(target, source) {
		if (target.type !== PROJECT_TYPE) {
			return;
		}

		if (source.type === TODO_TYPE) {
			updateContentWithTodo(target, source);
		} else {
			target.content = source.content;
		}

		Storage.setItem(target.id, target);
	}

	function get(key) {
		const projectObject = Storage.getItem(key);
		if (!projectObject) {
			return null;
		}

		return projectObject;
	}

	function updateTodo(target, source) {
		todoController.update(target, source);
	}

	function rename(key, newName) {
		const stored = Storage.getItem(key);
		if (!stored) {
			throw new Error(ERROR.KEY(key));
		}

		if (stored.type !== PROJECT_TYPE) {
			return;
		}

		stored.name = newName;
		Storage.setItem(stored.id, stored);
		console.log(`renamed project to ${stored.name}`);
	}

	function clearAll() {
		Storage.clear();
	}

	function removeTrash() {
		const todoArray = createOverviewTodoList(isTrash);
		todoArray.map((todoObject) => Storage.removeItem(todoObject.id));
	}

	function createOverviewTodoList(functionDateInterval) {
		const todoArray = [];
		const length = Storage.getLength();
		for (let i = 0; i < length; i++) {
			const key = Storage.key(i);
			const stored = Storage.getItem(key);
			if (!stored) {
				continue;
			}

			if (stored.type !== TODO_TYPE) {
				continue;
			}

			if (functionDateInterval(stored.dueDate)) {
				todoArray.push(stored);
			}
		}

		return todoArray;
	}

	function createProjectTodoList(projectID) {
		const todoArray = [];
		const length = Storage.getLength();
		for (let i = 0; i < length; i++) {
			const key = Storage.key(i);
			const stored = Storage.getItem(key);
			if (!stored) {
				continue;
			}

			if (stored.type !== TODO_TYPE) {
				continue;
			}

			if (stored.projectID !== projectID) {
				continue;
			}

			todoArray.push(stored);
		}

		todoArray.sort((a, b) => a.lineNumber - b.lineNumber);
		return todoArray;
	}

	return {
		updateTodoList,
		updateTodo,
		create,
		update,
		get,
		remove,
		clearAll,
		rename,
		toggleCheckbox,
		updateFromTodoToProject,
		removeTrash,
		createOverviewTodoList,
		createProjectTodoList,
	};
})();
