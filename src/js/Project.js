export function Project(name = "New project", creationDate = new Date())
{
    this.id = id();
    this.name = name;
    this.content = "";
    this.lastEditDate = creationDate;
    this.creationDate = creationDate;
    this.todoList = [];
}

function id()
{
    return (Date.now().toString(36) + Math.random().toString(36).substring(2));
}