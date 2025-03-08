export function Project(name = "New project", creationDate = new Date())
{
    this.iud = uid();
    this.name = name;
    this.content = "";
    this.lastEditDate = creationDate;
    this.creationDate = creationDate;
    this.todoList = [];
}

function uid()
{
    return (Date.now().toString(36) + Math.random().toString(36).substring(2));
}