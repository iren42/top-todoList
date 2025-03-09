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

        const dropdown = document.createElement("div");
        dropdown.classList.add("dropdown");

        const dropdownBtn = document.createElement("i");
        dropdownBtn.classList.add("fi", "fi-rr-menu-dots", "dropbtn");

        const dropdownContent = document.createElement("div");
        dropdownContent.classList.add("dropdown-content");
        dropdownContent.innerHTML = `
        <div class="rename-project">Rename</div>
        <div class="delete-project">Delete</div>
        `;

        dropdown.append(dropdownBtn, dropdownContent);

        button.append(icon, spanText, spanTooltip, dropdown);
        li.append(button);
        return (li);
    }
    return ({
        project
    })
})();
