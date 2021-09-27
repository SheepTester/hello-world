## git
```
git init
```
make the working directory a repository

```
git add PATH
```
adds files to commit

```
git add -u
```
add already-tracked files for commit

```
git commit -m "commit message"
```
commits file

```
git remote add origin https://github.com/try-git/try_git.git
```
idk:
> To push our local *repo* to the GitHub server we'll need to add a remote repository.
>
> This command takes a *remote name* and a *repository URL*, which in your case is **https://github.com/try-git/try_git.git**.

```
git push -u origin master
```
upload commits to Github. `-u` means we only have to do this once per repository

```
git push
```
upload commits to Github. do this after you did the above command

```
git pull origin master
```
gets commits from Github

```
git log
```
lists commit history

```
git diff HEAD
```
lists changes compared to *my* last commit
## node
```
npm install discord.js --save
npm install discord.js node-schedule --save
```
install dependences. apparently `--save` does some magic for you

```
node whatever.js
```
run file using node

```json
{
  "name": "idk-bot",
  "version": "1.0.0",
  "description": "whatevs",
  "main": "main.js",
  "author": "l'shep",
  "dependencies": {}
}
```
put it in `package.json`

test edit yay
