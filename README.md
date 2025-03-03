# Webpack template

[live demo]()

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
