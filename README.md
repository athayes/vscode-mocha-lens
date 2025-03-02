# vscode-mocha-lens


## Extension Settings

Jest Runner will work out of the box, with a valid Jest config.
If you have a custom setup use the following options to customize Jest Runner:

| Command                     | Description                                                                                                                      |
|-----------------------------|----------------------------------------------------------------------------------------------------------------------------------|
| jestrunner.configPath       | Jest config path (relative to `${workspaceFolder}` e.g. jest-config.json)                                                        |
| jestrunner.jestPath         | Absolute path to jest bin file (e.g. /usr/lib/node_modules/jest/bin/jest.js)                                                     |
| jestrunner.debugOptions     | Add or overwrite vscode debug configurations (only in debug mode) (e.g. `"jestrunner.debugOptions": { "args": ["--no-cache"] }`) |
| jestrunner.runOptions       | Add CLI Options to the Jest Command (e.g. `"jestrunner.runOptions": ["--coverage", "--colors"]`) https://jestjs.io/docs/en/cli   |
| jestrunner.baseGlob         | Base glob for tests                                                                                                              |


### Steps to run Extension in development mode

- Clone Repo
- npm install
- Go to Menu "Run" => "Start Debugging"

Another vscode instance will open with the just compiled extension installed.
