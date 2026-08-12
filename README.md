# ng-mocks examples and guides

This repository is a runnable consumer of the published
[`ng-mocks`](https://www.npmjs.com/package/ng-mocks) package. It is the
smallest playground used to verify that ng-mocks works in a real Angular
workspace, locally and in browser-based development environments.

Edit [`src/test.spec.ts`](src/test.spec.ts) to try an example. Documentation
for the library is on [ng-mocks.sudo.eu](https://ng-mocks.sudo.eu/).

## Repository branches and upstream sources

- `master` is the small public playground. It runs only `src/test.spec.ts`.
- `tests` merges `master` and also contains copies of the upstream ng-mocks
  `examples/` and `tests/` trees. `src/e2e.ts` imports all copied specs.
- ng-mocks is consumed from npm at the exact version in `package.json`. It is
  not a submodule, workspace package, or runtime link to the ng-mocks repo.
- When `tests` is refreshed, its copied sources come from the ng-mocks GitHub
  tag that matches the pinned npm version. The branch-specific sync workflow
  is documented in `.agents/ng-mocks-sync-tests/SKILL.md`.

This arrangement keeps the public sandbox small while letting the `tests`
branch exercise the same examples and specs against the published package.

## Run locally

Docker and Docker Compose are the only required local runtime dependencies.

```sh
sh ./compose.sh
sh ./test.sh
```

`compose.sh` installs the locked dependencies and Puppeteer's Chrome binary
inside the `core` environment. Its named cache volume keeps that browser
available to later test runs. `test.sh` starts Karma in single-run mode with
the `ChromeCi` launcher.

`install-browser.sh`, used by both `compose.sh` and CircleCI, derives the
headless-shell revision and expected executable path from the pinned
Puppeteer package. It downloads the matching official Chrome for Testing
archive only when the executable is missing and verifies it before tests.

Extra Angular test arguments are forwarded by the wrapper:

```sh
sh ./test.sh --browsers=ChromeCi
```

Formatting and type checks use the same environment as the repository hook:

```sh
docker compose run --rm core npm run prettier:check
docker compose run --rm core npm run ts:check
```

## Run remotely

[Open in CodeSandbox](https://codesandbox.io/p/sandbox/github/help-me-mom/ng-mocks-sandbox/tree/master/?file=/src/test.spec.ts)
or
[open in StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox?file=src/test.spec.ts).

Both services run `npm start`, which starts the Angular Karma builder in watch
mode. They do not launch Chrome themselves: the preview browser connects to
the exposed Karma page and displays the Jasmine runner.

- CodeSandbox uses `.devcontainer/devcontainer.json` and
  `.codesandbox/tasks.json`. `CSB=true` exposes Karma on port 4200.
- StackBlitz uses `.stackblitzrc`. `SB=true` exposes Karma on port 80.
- Both disable Husky and Puppeteer's browser download because the preview
  browser supplies the test client.

Without `CSB` or `SB`, `karma.conf.js` selects the local headless-Chrome path.

## Continuous integration

CircleCI installs the lockfile, checks formatting and TypeScript, validates
commit messages, and runs the Chrome suite. GitHub Actions runs CodeQL.
