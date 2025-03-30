# To-do list

[live demo](https://iren42.github.io/top-todoList/)

An assignment from The Odin Project's curriculum.
This is a website made with webpack, Javascript, HTML and CSS.

## Run this website app
Steps:
1. install npm dependencies
` npm install `
2. create dist/ directory with all our bundled files
` npm run build `
3. in dist/, open the file "index.html" with your browser.

Or, starting from step 2:

2. run
` npm run dev `
3. open http://localhost:8080 in your browser.

## Update deployment
> **_ONLY_** do this after your work is committed.

Steps to update your deployed git branch (gh-pages):
1. `git checkout gh-pages && git merge main --no-edit ` to change branch and sync your changes from main so that you’re ready to deploy.
2. `npm run build` or `npx webpack --config webpack.prod.js` 
3. `git add dist -f && git commit -m "Deployment commit"`
4. `npm run deploy` or `git subtree push --prefix dist origin gh-pages`
5. `git checkout main`

## How it looks
![To-do app](./doc/images/start-app.png "To-do application")

## How it works
> **_IMPORTANT_**
> - Deleting a project will delete all of its to-do tasks
> - to-do tasks are forever bound to the project that created them
> - to-do tasks are also bound to the project's line number in the editor
> - to-do tasks with a due date that has already passed are thrown in the "Trash"

### Get started:
1. Create a new project by clicking on the sidebar icon next to "PROJECTS"
1. Write stuff in the center of the page with the "Write here..." text (this is the editor)
1. Write a to-do task by prefixing your task by "- [ ] " (be sure to add the whitespaces)
E.g.
![Write a to-do](./doc/images/write-todos.png "how to write to-dos")
1. Click on the "Save" button
1. You have created to-do tasks. The app should look like this:
![To-do tasks](./doc/images/created-todos.png "your to-do tasks")

## Things it can do
- create projects and to-do tasks
- check to-do tasks in the task object (on the right side of the page)
- checK to-do tasks in the editor by replacing the prefix "- [ ] " to "- [x] " (it is the markdown syntax). Always remember to save the latest changes made in the editor
- edit to-do task in the editor and in the task object
- add a due date and a due time to the tasks
- change a task's priority level
- delete tasks in the editor by deleting the to-do prefix ("- [ ] " or "- [x] ")
- rename projects and to-do tasks
- delete projects and to-do tasks

## Why I made my app like that
I wanted to be able to create multiple to-do tasks at once, without having to constantly click on buttons.
I used the markdown syntax because I like markdown, I use it for my personal notes.
