export const DOMCreator = (function ()
{
    function project(name, iud)
    {
        const li = document.createElement("li");
        // li.classList.add("project");

        const button = document.createElement("button");
        button.type = "button";
        button.classList.add("project");
        button.id = iud;

        const icon = document.createElement("i");
        icon.classList.add("fi", "fi-rr-file", "project-icon");

        const spanText = document.createElement("span");
        spanText.classList.add("project-text");
        spanText.textContent = name;

        const spanTooltip = document.createElement("span");
        spanTooltip.classList.add("tooltip");
        spanTooltip.textContent = name;

        button.appendChild(icon);
        button.appendChild(spanText);
        button.appendChild(spanTooltip);
        li.appendChild(button);
        return (li);
    }
    return ({
        project
    })
})();
