import "./css/normalize.css";
import "./css/style.css";
import "./css/main.css";

if (process.env.NODE_ENV !== 'production')
{
    console.log('Looks like we are in development mode!');
}
{
    let sideBar = document.querySelector('.sidebar');
    let arrowCollapse = document.querySelector('#collapse-sidebar-icon');
    if (arrowCollapse && sideBar)
    {
        arrowCollapse.onclick = () =>
        {
            sideBar.classList.toggle('collapse');
            arrowCollapse.classList.toggle('collapse');
            if (arrowCollapse.classList.contains('collapse'))
            {
                arrowCollapse.classList = "fi fi-rr-angle-right collapse";
            }
            else
            {
                arrowCollapse.classList = "fi fi-rr-angle-left";
            }
        };
    }
}
{
    const editor = document.querySelector(".editor");
    const preview = document.querySelector(".preview");
    document.addEventListener("click", event =>
    {
        // console.log(event.target);
        if (event.target.closest("#saveBtn"))
        {
            console.log("save");
            console.log(editor.innerText);
            preview.innerText = editor.innerText;
        }
    })
}