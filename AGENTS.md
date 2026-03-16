# Local agent skills

Reusable repo-specific skills live under `.agents/`.

Use `.agents/ng-mocks-sync-tests/SKILL.md` when updating the `tests` branch from upstream `ng-mocks` tests/examples or when cleaning diff noise after such a sync.

When editing files for this workflow:

- follow the repo hook convention from `.husky/pre-commit`:
  - `docker compose run core npm ...`
  - `docker compose run core npx ...`
  - `docker compose run core node ...`
- do not run Prettier or tests directly on the host; run them through the `core` container
- run repo commands for this workflow through `core` as `docker compose run core <command>`
- for bundled scripts in `.agents/ng-mocks-sync-tests/scripts`, use the matching command inside `core`, for example:
  - `docker compose run core bash ./.agents/ng-mocks-sync-tests/scripts/<script>.sh`
  - `docker compose run core sh ./.agents/ng-mocks-sync-tests/scripts/<script>.sh`
  - `docker compose run core npm ...`
- prefer diff-driven cleanup over whole-file pattern rewrites
- inspect committed-vs-working-tree hunks first and patch only the changed lines when possible
- for recurring structural cleanups, search by anchor like `try {`, then inspect a 10-15 line diff hunk before changing anything
- when a hunk only uses `try/catch` to assert `error.message`, normalize it to `toThrowError(...)` or `expectAsync(...).toBeRejectedWithError(...)` based on whether the throw is sync or async
- exception: if `expectAsync(...)` makes an async spec noticeably less readable, keep the original `try/catch`
- if an async spec originally keeps setup and the throwing call inside the same `try` block, preserve that structure; do not pull the throwing call out just to use `toThrowError(...)`
- preserve the original assertion semantics when converting throw checks:
  - original `toContain(...)`: use a regex-based throw matcher such as `toThrowError(new RegExp('...'))`
  - original `toEqual(...)` or existing exact `toThrowError('...')`: keep an exact string matcher
  - original `toMatch(...)` or existing regex throw matcher: keep a regex matcher
- normalize obsolete Angular constructor shims like `new (InjectionToken as any)(...)` to `new InjectionToken(...)`, and remove adjacent `A5` comments when they were only documenting that shim
- prefer Jasmine code paths in sandbox specs
- keep Jest only as adjacent comments when the comment is useful documentation
- put the Jest hint after the Jasmine expression:
  - next line as `// or ...` for a final expression
  - inline on the same line when more real args/properties follow
- preserve decorator metadata object braces when removing obsolete fields
