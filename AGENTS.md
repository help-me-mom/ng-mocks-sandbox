# Repository instructions for AI agents

## Purpose and branch model

This is a consumer-side Angular playground for the published `ng-mocks`
package. Do not treat it as the ng-mocks library source tree.

- `master`: minimal public playground; `src/e2e.ts` imports only
  `src/test.spec.ts`.
- `tests`: merges `master`, then adds copied upstream examples/tests and a
  generated `src/e2e.ts` import list.
- There is no submodule, workspace dependency, symlink, or automatic runtime
  inheritance from `help-me-mom/ng-mocks`.
- The exact `ng-mocks` dependency in `package.json` is the source of truth.
  On `tests`, copied sources must come from the matching upstream `v<version>`
  tag.

Read `README.md`, `package.json`, `karma.conf.js`, `compose.yml`, and the
remote-environment files before changing runtime behavior.

## Commands and validation

Run repository npm, npx, Node, formatting, and test commands through the
`core` service. Do not run them directly on the host.

```sh
docker compose run --rm core npm ...
docker compose run --rm core npx ...
docker compose run --rm core node ...
```

Use the checked-in wrappers for a clean local setup and full local test:

```sh
sh ./compose.sh
sh ./test.sh
```

`compose.sh` and CircleCI let Puppeteer's npm lifecycle download the pinned
Chrome Headless Shell, then repair any ZIP left in Puppeteer's cache with the
same extraction pattern used by upstream ng-mocks; keep those paths in sync.
`PUPPETEER_SKIP_CHROME_DOWNLOAD` intentionally skips full Chrome while allowing
the headless shell. Puppeteer's installer does not await archive extraction
reliably on current Node versions, so keep the cache repair and executable
check. Puppeteer 25 made `executablePath()` asynchronous; await its result
before using it.

Before committing, run at least:

```sh
docker compose run --rm core npm run prettier:check
docker compose run --rm core npm run ts:check
sh ./test.sh
```

The pre-commit hook runs Prettier in write mode and TypeScript through the
same service. Inspect its changes before committing. CircleCI also validates
the commit message with commitlint.

## Local and remote Karma modes

- Local (neither `CSB` nor `SB`): Puppeteer provides Chrome, Karma uses
  `ChromeCi`, and the suite runs once.
- CodeSandbox (`CSB=true`): Karma listens on `0.0.0.0:4200`, watches, and waits
  for the preview browser instead of launching one.
- StackBlitz (`SB=true`): the same browser-client model uses port 80.

Preserve this split when editing `karma.conf.js`, `.codesandbox/tasks.json`,
`.devcontainer/devcontainer.json`, or `.stackblitzrc`.

## Dependency upgrades

- Keep Angular framework packages and `@angular/compiler-cli` on one exact
  framework version.
- Keep Angular CLI/build packages on one exact CLI version.
- Check Angular's official Node and TypeScript compatibility ranges before a
  major upgrade.
- Verify the selected ng-mocks release explicitly supports that Angular
  major, and pin the published release rather than a repository checkout.
- Preserve the `karma-jasmine` override that resolves its bundled
  `jasmine-core` dependency to the project's pinned version. Without it,
  `karma-jasmine` injects Jasmine 4.6.1, which crashes in StackBlitz on Safari
  when a stack trace contains fewer frames than Jasmine expects. After a
  Jasmine or Karma upgrade, confirm `npm ls jasmine-core karma-jasmine`
  reports one deduplicated Jasmine version.
- Jasmine 6 deliberately reports compatibility deprecations for
  `karma-jasmine` and Zone.js. `src/jasmine-deprecations.js` filters only the
  two known framework messages before `zone.js/testing` loads and passes every
  other deprecation through. Keep the message matches exact so changed or new
  upstream warnings become visible and can be reviewed.
- Regenerate `package-lock.json` through `core`; do not hand-edit it.
- Run Angular migrations when a major upgrade defines required workspace
  migrations. Treat optional build-runner migrations separately because this
  repo intentionally supports browser-hosted Karma.

## Syncing the `tests` branch

Use `.agents/ng-mocks-sync-tests/SKILL.md` only when updating `tests` from the
matching upstream ng-mocks tag or cleaning the resulting compatibility diff.
Do not run that import workflow on `master`.

For synced specs, preserve upstream behavior and make only confirmed
sandbox-specific compatibility edits. Prefer Jasmine runtime paths; keep Jest
alternatives only as useful adjacent comments. Preserve assertion semantics,
decorator metadata braces, and the structure of async throw tests.

## Change discipline

- Use diff-driven edits and avoid unrelated dependency or source cleanup.
- Never commit generated test reports, Angular caches, `node_modules`, browser
  caches, or credentials.
- Follow the repository's conventional commit history. Major Angular support
  commits use the form `chore(a<major>): angular <major> support`.
