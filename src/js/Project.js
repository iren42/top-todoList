export const PROJECT_TYPE = "PROJECT";
export function Project(name = "New project", creationDate = new Date())
{
    this.id = uid();
    this.name = name;
    this.content = "";
    this.lastEditDate = creationDate;
    this.creationDate = creationDate;
    this.type = PROJECT_TYPE;
}

function uid()
{
    return (Date.now().toString(36) + Math.random().toString(36).substring(2));
}