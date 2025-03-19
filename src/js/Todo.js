export const TODO_TYPE = "TODO";
const TODO_SEPARATOR = "#";
export const TODO_PREFIX = "- [ ] ";
export function Todo(projectID, lineNumber, title = "", dueDate = new Date() ) {
    this.type = TODO_TYPE;
    this.description = "";
    this.dueDate = dueDate;
    this.title = title;
    this.id = `${lineNumber}${TODO_SEPARATOR}${projectID}`;
    this.isCompleted = false;
    this.priority = 0;
    this.projectID = projectID;
}