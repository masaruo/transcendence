### vscode
1. install devcontainer
2. activate
3. npm run dev


### non vscoder
1. docker compose up -d
2. docker container exec -it <container name> bash
3. npm run dev

# initial set up
inside the container, npm install

# CONNECT network
docker network connect transcendence <container name:frontend-node-1>
