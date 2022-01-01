---
title: "React DevEnv with VSCode in 5 minutes"
date: 2021-12-21T20:27:39+01:00
draft: false
hero: hero.jpg
menu:
  sidebar:
    name: VSCode React DevEnv
    identifier: vscode-react-devenv
    weight: 30
---

{{< photoCredit
  via="Unsplash" viaHref="https://unsplash.com/s/photos/coding?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText"
  by="Kevin Ku" byHref="https://unsplash.com/@ikukevk?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" >}}

## Our target setup & why
Have you ever worked on multiple projects where language or version differ from one another? If the answer is yes, you probably have been playing around with tools like `nvm` or `asdf` or `<input here whatever other language version manager>` and have your system cluttered with a bunch that you may not even use anymore.

In this post, I am trying out vscode `devcontainers` as a potential solution for a better dev environment. So let's check what are our goals today:
- [ ] No install of nodejs/react on host 
- [ ] No need for nvm/asdf ...
- [ ] Easy setup sharing with other team member


## Prerequisites

To follow along with this post, make sure to have the following tools installed on your system.
- [Docker](https://www.docker.com/get-started)
- [Visual Studio Code](https://code.visualstudio.com/download)
- [Remote - Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) extension

Although not absolutely necessary, a basic knowledge of Docker would be helpful to understand the concepts of containers and images.


## Devcontainer setup for React and typescript

The extension `Remote - Containers` comes with a bunch of base images for setting up a development environment. I will be using one of the Node.js base image, as I want to use React.

Let's scaffold the configuration files for your first `devcontainer`:
{{< img src="01_cmdAddDevContainerFile.png" >}}

1. Open command palette (⇧⌘P)
2. Select `Remote-Containers: Add Development Container configuration files`
3. Select option `Node.js & TypeScript`
4. Choose the version of Node.js, `16-bullseye` in my case
5. *(optional)* Add extra features needed/wanted. I am adding `Java` so that I can use `SonarLint` (and no need for a Java runtime on my host machine, yeah)

At this stage you should have a `.devcontainer` folder containing the following files:
- devcontainer.json
- Dockerfile

With this, we are ready to start working inside the `devcontainer`. All that is left to do is to relaunch vscode inside of the devcontainer. To do so, open the command palette (⇧⌘P) and select `Remote-Containers: Open Folder in Container`. Note that you can also reach this command by clicking the little purple icon at the bottom left of the vscode window.

Now vscode should be connected to the newly created dev container and the purple icon should have expanded and display something like `Dev Container: Node.js & TypeScript`.

Opening a terminal inside vscode so will connect it directly to the underlying Docker container. Let's type the usual command to init a react project `npx create-react-app my-app --template typescript` (or follow the former steps to add a dev container to an existing react/node.js project).

Finally, if you clone a repository having this `.devcontainer` folder and open it in vscode, a pop-up will propose to reopen vscode in the container. This is especially useful to ensure that each developer contributing to the project has the same environment.


## Bonus 1 - Customize your dev env container
We just saw that the `.devcontainer` can easily be shared via a git repository. Let's now take it a step further and explore customization option that are available by editing the generated files `Dockerfile` and `devcontainer.json`.

```Dockerfile
# See here for image contents: https://github.com/microsoft/vscode-dev-containers/tree/v0.209.6/containers/typescript-node/.devcontainer/base.Dockerfile

# [Choice] Node.js version (use -bullseye variants on local arm64/Apple Silicon): 16, 14, 12, 16-bullseye, 14-bullseye, 12-bullseye, 16-buster, 14-buster, 12-buster
ARG VARIANT="16-bullseye"
FROM mcr.microsoft.com/vscode/devcontainers/typescript-node:0-${VARIANT}

# [Optional] Uncomment this section to install additional OS packages.
# RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
#     && apt-get -y install --no-install-recommends <your-package-list-here>

# [Optional] Uncomment if you want to install an additional version of node using nvm
# ARG EXTRA_NODE_VERSION=10
# RUN su node -c "source /usr/local/share/nvm/nvm.sh && nvm install ${EXTRA_NODE_VERSION}"

# [Optional] Uncomment if you want to install more global node packages
# RUN su node -c "npm install -g <your-package-list -here>"

```

The generated `Dockerfile` is really comprehensive and has a bunch of commented statement to help adding things to the base image even if you are not very familiar with Docker (though I would recommend to learn a bit about how docker works).

Want a global npm packages you want to be installed (for example, create-react-app)? Then uncomment the last line and input your packages and, well that's it.

It is also possible to add other dependencies inside the image by adding lines like `RUN apt-get -y install <some package>`. This would be a good place to install a Java runtime rather than using the Java option during the setup to avoid the extra stuff it may add inside the dev env but that may not be wanted. If you want full control on the Docker image and what it contains, you could even [create your own image](https://code.visualstudio.com/docs/remote/create-dev-container).

Now let's have a look at the `devcontainer.json` file. The `settings` key allows you to define default vscode settings. This is useful to provide sane defaults for your team. Note that these settings would be overridden by user local settings if they already define the same settings on their local machine. For example, if you wanted to add vertical rulers to refrain your team member from writing lines of 300 characters or more... (but who would do that if they are really sane... :scream:?)
```json
	// Set *default* container specific settings.json values on container create.
	"settings": {
		"editor.rulers": [80,120],
		"workbench.colorCustomizations": {
			"editorRuler.foreground": "#ff4081"
		}
	},
```

The other key I want to mention here is `extensions`. It enables installing default extensions on the devcontainer. This way, you can make sure nobody in your team will ever forget about fixing eslint errors for example since they will have the extension installed :smiling_imp:. Remember that I wanted Java in my base image earlier? Well, this is where it becomes interesting. I can now add the `SonarLint` extension on the container and I absolutely do not need to have a JRE/JDK installed on my host, only inside my dev container.

```json
	// Add the IDs of extensions you want installed when the container is created.
	"extensions": [
		"dbaeumer.vscode-eslint",
		"sonarsource.sonarlint-vscode"
	],
```

## Bonus 2 - Enable debugging with Chrome
It would be a shame having such a nice development environment and being unable to debug your application, right? Good news for us, debugging works seamlessly and I was able to run the React app, launch the debug session and hit my breakpoints without any problem.

The sample `launch.json` file below should be copied inside the folder `.vscode` in the workspace root.

```json
{
    // Use IntelliSense to learn about possible attributes.
    // Hover to view descriptions of existing attributes.
    // For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387
    "version": "0.2.0",
    "configurations": [
        {
            "type": "pwa-chrome",
            "request": "launch",
            "name": "Launch Chrome against localhost",
            "url": "http://localhost:3000",
            "webRoot": "${workspaceFolder}"
        }
    ]
}
```

Now, after launching the app with `npm start` from the terminal inside the `devcontainer`, you can launch the debug and it just works.

## Closing notes

`Devcontainers` are a very powerful addition to vscode. We have seen here some of the possibilities offered but there is much more to explore. If you find it useful and want to dig more, check out [this article](https://code.visualstudio.com/docs/remote/containers) from the official docs.

For large projects or with many contributors, I would recommend preparing a fine tuned base image that suits the team needs but it is perfectly fine to use one of the base image available to get started. Also, I have not covered here the possibilities offered with `docker-compose`, which can be used to have a database container running alongside the devcontainer.

Thank you for reading, I hope that the devcontainers will be useful to you. Please leave a comment to share your opinion or if you have a question.

{{< graphcomment commentThreadUid="devcontainer_91b62457-ad59-5a28-8e92-2035d3f6b2cb" >}}
