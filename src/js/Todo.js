export const TYPE_TODO = "TODO";
export const TODO_PREFIX = "- [ ] ";
export function Todo(projectID, lineNumber, title = "", dueDate = new Date() ) {
    this.type = TYPE_TODO;
    this.description = "";
    this.dueDate = dueDate;
    this.title = title;
    this.id = `${lineNumber}#${projectID}`;
    this.isCompleted = false;
    this.priority = 0;
    this.projectID = projectID;
}