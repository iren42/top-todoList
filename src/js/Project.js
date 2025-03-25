import { TODO_PREFIX, TODO_PREFIX_DONE, todoController, TODO_SEPARATOR } from './Todo.js';
import * as Storage from './storage.js';
import * as ERROR from './error_constants.js';

export const PROJECT_TYPE = 'PROJECT';

function Project(name = 'New project', creationDate = new Date()) {
	this.id = uid();
	this.name = name;
	this.content = '';
	this.lastEditDate = creationDate;
	this.creationDate = creationDate;
	this.type = PROJECT_TYPE;
}

function uid() {
	return (Date.now().toString(36) + Math.random().toString(36).slice(2));
}

function isTodo(string_) {
	if (!(typeof string_ === 'string'))
		return (false);
	if (string_.indexOf(TODO_PREFIX) !== 0 && string_.indexOf(TODO_PREFIX_DONE) !== 0)
		return (false);
	return (true);
}

export const projectController = (function() {
	function removeTodoSurplus(database, projectObject, limit) {
		for (let i = 0; i < database.length; i++) {
			const key = database.key(i);
			const stored = Storage.getItem(database, key);
			if (!stored)
				throw new Error(ERROR.KEY(key));
			if (stored.type === PROJECT_TYPE)
				continue;
			if (stored.projectID !== projectObject.id)
				continue;

			const index = stored.id.indexOf(TODO_SEPARATOR);
			const number_ = stored.id.slice(0, Math.max(0, index));
			if (Number(number_) < limit)
				continue;

			remove(localStorage, key);
		}
	}

	function updateTodoList(database, projectObject) {
		const lines = projectObject.content.split('\n');
		removeTodoSurplus(database, projectObject, lines.length);
		for (const [i, line] of lines.entries()) {
			const title = line.slice(TODO_PREFIX.length);
			const key = todoController.getKey(i, projectObject.id);
			const hasX = (!line.indexOf(TODO_PREFIX_DONE));
			let isChecked = "off";
			if (hasX)
				isChecked = "on";
			const buf = {
				title,
				isChecked
			};

			if (!isTodo(line)) {
				Storage.removeItem(database, key);
				continue;
			}

			const todo = Storage.getItem(database, key);
			// Update todos that have different title
			if (todo) {
				todoController.update(localStorage, todo, buf);
			}
			else if (hasX)
				todoController.create(database, projectObject.id, i, title, "on");
			else
				todoController.create(database, projectObject.id, i, title);
		}
	}

	function create(database) {
		const newProject = new Project();
		Storage.setItem(database, newProject.id, newProject);
		return (newProject);
	}

	// 'delete' is a reserved word
	function remove(database, key) {
		console.log('remove ' + key);
		Storage.removeItem(database, key);
	}

	function update(database, key, newContent) {
		const projectObject = Storage.getItem(database, key);
		if (!projectObject)
			throw new Error(ERROR.KEY(key));
		if (projectObject.type !== PROJECT_TYPE)
			return;

		projectObject.content = newContent;
		Storage.setItem(database, projectObject.id, projectObject);
	}

	function get(database, key) {
		const projectObject = Storage.getItem(database, key);
		if (!projectObject)
			return (null);

		return (projectObject);
	}

	function updateTodo(database, target, source) {
		todoController.update(database, target, source);
	}

	function rename(database, key, newName) {
		const stored = Storage.getItem(database, key);
		if (!stored)
			throw new Error(ERROR.KEY(key));
		if (stored.type !== PROJECT_TYPE)
			return;

		stored.name = newName;
		Storage.setItem(database, stored.id, stored);
		console.log(`renamed project to ${stored.name}`);
	}

	function clearAll(database) {
		Storage.clear(database);
	}

	return ({
		updateTodoList,
		updateTodo,
		create,
		update,
		get,
		remove,
		clearAll,
		rename,
	});
})();
