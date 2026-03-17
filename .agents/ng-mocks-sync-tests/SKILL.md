---
name: ng-mocks-sync-tests
description: Use when syncing ng-mocks-sandbox tests/examples from upstream ng-mocks, regenerating e2e.ts, and replaying only sandbox-specific compatibility edits that are still required.
---

# ng-mocks sandbox test sync

Use this skill when updating the `tests` branch from upstream `ng-mocks`.

## Goal

Keep `src/tests`, `src/examples`, and `src/e2e.ts` aligned with upstream while preserving only real sandbox-specific compatibility changes that are still required in this sandbox.

This skill should be usable by a medium-reasoning agent without extra repo knowledge. Follow it literally.

## Core rules

- Use this skill only for the `tests` sync workflow.
- Run repo commands through `core` only:
  - `docker compose run --rm core <command>`
- Do not run host `npm`, host `npx`, host `node`, host `prettier`, or host tests.
- User instructions override this skill.

## Step 3 boundaries

During Step 3, the agent may do only these actions:

1. Run the Step 3 script.
2. Apply a manual patch for the diff returned by that script.
3. Run Prettier on the current Step 3 file.
4. If the same file comes back, stage that file with `git add <current-step3-file>`.

During Step 3, do not:

- run any other terminal command
- search the repo
- inspect other files to decide the patch
- run tests
- use history lookups
- use git commands other than `git add <current-step3-file>` when the same file comes back

The Step 3 script output is the only diff source for Step 3 decisions.

## Commands

Run bundled scripts like this:

- `docker compose run --rm core sh ./.agents/ng-mocks-sync-tests/scripts/step1_sync_upstream_sources.sh`
- `docker compose run --rm core sh ./.agents/ng-mocks-sync-tests/scripts/step2_regenerate_e2e.sh`
- `docker compose run --rm core sh ./.agents/ng-mocks-sync-tests/scripts/step3_list_changed_synced_files.sh`

Run Prettier like this:

- `docker compose run --rm core npx prettier --write <repo-relative-file>`

Run tests like this:

- `sh ./compose.sh`
- `sh ./test.sh`

Notes:

- `compose.sh` is the required bootstrap step for Step 4 in this repo.
- It installs dependencies and Puppeteer browser binaries for both the `core` container and the host checkout.
- Do not replace it with ad hoc `npx puppeteer ...` commands.
- `test.sh` is the repo-local test wrapper for this workflow:
  - `sh ./test.sh`
  - `sh ./test.sh coverage`

## Default workflow

1. Start on branch `tests`.
2. Merge `master` into `tests`.
3. Run Step 1.
4. Run Step 2.
5. Run Step 3.
6. Process Step 3 files one at a time.
7. Run Step 4.

## Step 4 algorithm

Run Step 4 after Step 3 returns no file.

1. Run final Prettier and make sure formatting is clean.
2. Install dependencies and browser binaries:
   - `sh ./compose.sh`
3. Run tests:
   - `sh ./test.sh`
4. Treat this wrapper flow as required repo behavior, not an optional convenience:
   - `compose.yml` provides the `NODE_OPTIONS=--max-old-space-size=8192` memory setting for `core`
   - `compose.yml` also persists `/root/.cache` so the browser installed by `compose.sh` is visible to later `docker compose run --rm core ...` commands
5. If tests pass, the workflow is done.
6. If tests fail, inspect the failures.
7. Fix only failures that are clearly caused by sync transformations or Angular 21 compatibility fallout introduced or exposed by the sync.
8. Typical Step 4 fixes include:
   - provider error message matcher updates such as `No provider found for ...`
   - regex matcher updates needed for Angular 21 wording
   - application-initializer / root-provider expectation updates caused by Angular 21 behavior
   - other assertion updates that are clearly required to keep synced tests passing on Angular 21
9. Do not use Step 4 as permission for unrelated refactors.
10. After fixing those failures, rerun Prettier if needed, then rerun `sh ./test.sh`.
11. Repeat until tests pass.

## Step 3 algorithm

Treat this as the exact loop.

1. Run:
   - `docker compose run --rm core sh ./.agents/ng-mocks-sync-tests/scripts/step3_list_changed_synced_files.sh`
2. If no file is returned, Step 3 is done.
3. If a file is returned, inspect only the printed diff for that file.
4. Decide whether the diff is:
   - upstream-only
   - sandbox compatibility cleanup
   - unclear
5. If it is unclear, stop and report that.
6. If it is upstream-only, leave it unchanged.
7. If it is sandbox compatibility cleanup, apply only the minimum confirmed patch for the current file.
8. Before applying the patch, do a category-completeness check:
   - if the diff shows a confirmed cleanup category from this skill, finish that same category across the current file
   - do not stop after the first matching hunk if the same confirmed category appears later in the current file
9. Report only the repo-relative file path before applying the patch.
10. Apply the patch.
11. Run:
    - `docker compose run --rm core npx prettier --write <current-step3-file>`
12. Run Step 3 again.
13. Compare the new returned file path with the previous file path.
14. If the same file comes back:
    - default behavior: stage that file with `git add <current-step3-file>` and continue
    - if the user asked for review-stop mode: stop, tell the user the same file came back, and show the current returned diff
15. If a different file comes back, continue the loop.

## Patch scope rules

- Patch the current Step 3 file only.
- Patch only the printed diff hunk unless this skill explicitly tells you to finish the same confirmed category across the current file.
- Do not improve unrelated code.
- Do not rewrite a whole file because one line changed.
- Preserve blank lines unless the cleanup itself requires a format change.
- Preserve simple line shape unless the cleanup itself requires a format change.
- Keep same-line declarations on one line when they still fit after cleanup.

## How to classify a diff

Use this rule of thumb:

- If the diff reintroduces old Angular compatibility shims, old RxJS compatibility shims, Jest fallback runtime helpers, or verbose throw-assertion `try/catch` patterns that this repo does not want, clean it up.
- If the diff looks like a real upstream behavior change or new test coverage, leave it alone.
- If you cannot confidently tell whether the diff is sandbox-only compatibility noise, stop and report that.

## Normalization catalog

Only apply these when they are clearly compatibility leftovers.

### Property shims

- `['standalone' as never ...]: false` -> `standalone: false`
- `['standalone' as never ...]: true` -> remove the field
- `['imports' as never ...]: value` -> `imports: value`
- `['hostDirectives' as never ...]: value` -> `hostDirectives: value`
- `['entryComponents' as never /* TODO remove entryComponents after A16+ support */]: value` -> remove the field

Rules:

- Keep explicit `standalone: false` because the default is `true`.
- Never keep or invent `standalone: true`.
- If removing `standalone: true` leaves an empty metadata object, collapse to `@Directive()`, `@Component()`, or `@Pipe()`.
- If one confirmed property-shim cleanup exists in the current file, finish that same property-shim category across the file.

### Decorator query casts

- `@ContentChild('x', {} as never)` -> `@ContentChild('x')`
- `@ContentChild(Type, {} as never)` -> `@ContentChild(Type)`
- `@ContentChildren(Type, {} as never)` -> `@ContentChildren(Type)`
- `@ViewChild('x', { read: T } as never)` -> `@ViewChild('x', { read: T })`
- `@ContentChildren(Type, { read: T } as never)` -> `@ContentChildren(Type, { read: T })`

Rules:

- Keep simple decorator + property declarations on one line when they still fit after cleanup.
- If the diff only split a simple decorator from its property declaration, fold it back:
  - `@ContentChild(CellDirective)`
  - `public cell?: CellDirective;`
  - -> `@ContentChild(CellDirective) public cell?: CellDirective;`

### Decorator metadata casts

- `@Directive({...} as never)` -> `@Directive({...})`
- `@Component({...} as never)` -> `@Component({...})`
- `@Pipe({...} as never)` -> `@Pipe({...})`

Rules:

- Keep metadata braces intact unless the metadata becomes empty.

### Alias decorator cleanup

- `@Output({ alias: 'x' } as never)` -> `@Output('x')`
- `@Input({ alias: 'x' } as never)` -> `@Input('x')`

Rules:

- If alias metadata has real options like `required`, keep object form and remove only the compatibility cast.

### Line shape cleanup

Use this only for formatting noise caused by compatibility edits.

- preserve simple one-line declaration shape when it still fits
- if upstream splits a decorator field from its declaration without changing semantics, fold it back
- do this for simple decorator + property patterns such as `@ContentChild`, `@ContentChildren`, `@ViewChild`, `@Input`, `@Output`, and similar declarations

### Version guard cleanup

- Remove `VERSION.major` checks when they only preserve older Angular behavior.
- Prefer Angular 21 style in this repo.
- If upstream adds `TestBed.get` / `TestBed.inject` branching, keep `TestBed.inject(...)`.

### Jasmine vs Jest cleanup

This repo prefers Jasmine runtime code.

Normalize these back to the direct Jasmine form:

- `typeof jest === 'undefined' ? jasmine.createSpy() : jest.fn()`
- `const assertion: any = typeof jasmine === 'undefined' ? expect : jasmine;`
- `assertion.any(...)`
- `assertion.objectContaining(...)`
- `assertion.stringMatching(...)`
- `expect.any(...)` used only as a runtime compatibility fallback

Keep these forms:

- `const spy = jasmine.createSpy(); // or jest.fn();`
- `output: jasmine.createSpy(), // or jest.fn(),`
- `expect(value).toEqual(jasmine.any(Object));`
- existing useful Jest comments, unchanged

Rules:

- If the current file contains a forbidden Jest helper pattern, finish that same helper category across the whole file.
- Keep Jest only as adjacent comments when useful.
- Do not rewrite the wording or placement of an existing useful Jest comment just to make it match another style.
- Use inline comment when more code follows on the same line.
- Use next-line comment only when the expression is final.

### InjectionToken cleanup

- `new (InjectionToken as any)(...)` -> `new InjectionToken(...)`

Rules:

- Remove adjacent `A5` comments when they only explain that old shim.

### RxJS EMPTY cleanup

If upstream reintroduces a local shim backed by `new Subject(...)` for standard RxJS exports:

- restore the direct RxJS import
- remove the local shim block
- remove `Subject` only if it becomes unused after cleanup

Examples:

- local `EMPTY` shim -> restore `import { EMPTY } from 'rxjs';`
- local `EMPTY` + `NEVER` shim -> restore only the standard imports actually needed after cleanup

### RxJS import cleanup

If upstream reintroduces a compatibility shim for a standard RxJS export such as `fromEvent`:

- restore the normal import:
  - `import { fromEvent } from 'rxjs';`
- remove the shim block, for example:
  - `let fromEvent: any;`
  - `try { fromEvent = (rxjs as any).fromEvent; } catch { ... }`
- remove conditional runtime branches that only exist for that shim
- restore the direct subscription / assertion flow once the standard import is back

### Regex normalization

Use one consistent regex rule in this repo:

- use `new RegExp(...)`
- do not use regex literals like `/.../`

Examples:

- `expect(message).toMatch(new RegExp('Cannot find fail input via ngMocks\\.input'));`
- `expect(fn).toThrowError(new RegExp('Cannot find a TemplateRef via ngMocks\\.findTemplateRef\\(unknownId\\)'));`
- `new RegExp(\`No provider( found)? for \\\`?${ProviderService.name}\\\`?\`)`

Rules:

- escape backslashes for both the string and the regex
- escape regex metacharacters inside the string
- prefer template strings when interpolation is required
- prefer template strings when they avoid awkward quote escaping
- if the current file contains mixed regex styles for the same confirmed cleanup case, normalize them to `new RegExp(...)`

### Throw assertion cleanup

Only convert `try/catch` when the block exists only to assert the thrown error.

Convert these sync cases:

- `try { fn(); fail(...); } catch (error) { expect(error.message)... }`
- `try { fn(); } catch (error) { expect(error.message)... }`
- guarded catch blocks used only for message assertions:
  - `catch (error) { if (error instanceof Error) { expect(error.message)... } else { fail(...) } }`
  - `catch (error) { expect((error as Error).message)... }`

Use:

- sync throw -> `toThrowError(...)`

Rules:

- If the printed diff shows a direct regression from `toThrowError(...)` to `try/catch`, restore the throw matcher.
- Preserve matcher intent:
  - exact string checks -> exact string matcher
  - partial or regex checks -> `new RegExp(...)`

Keep `try/catch` for async cases:

- If cleanup would require `expectAsync(...)`, keep the original `try/catch`.
- If the code is `await ...; thrower();` inside one `try`, keep the `try/catch`.
- Do not force `expectAsync(...)` just because a block is async.

### What not to normalize automatically

Do not automatically normalize:

- unrelated refactors
- general style changes outside a confirmed cleanup category
- real upstream behavior changes
- comment wording changes unless they are part of a confirmed compatibility cleanup

## Fast decision guide

If you see this, do this:

- `['standalone' as never ...]: false`
  - change to `standalone: false`
- `['standalone' as never ...]: true`
  - remove it
- `@ContentChild('x', {} as never)` or a similar query cast
  - remove the cast and keep the declaration on one line if it still fits
- simple decorator + property split across two lines with no semantic reason
  - fold it back onto one line
- `typeof jest === 'undefined' ? ...`
  - restore the direct Jasmine form
- `assertion.any(...)` / `assertion.objectContaining(...)` / `assertion.stringMatching(...)`
  - restore the direct Jasmine matcher
- `new (InjectionToken as any)(...)`
  - change to `new InjectionToken(...)`
- local `EMPTY` / `NEVER` shim backed by `new Subject(...)`
  - restore direct RxJS imports and remove the shim block
- local fallback shim for `fromEvent`
  - restore the direct RxJS import and remove the shim flow
- sync `try/catch` used only for `error.message`
  - convert to `toThrowError(...)`
- async `try/catch` where conversion would require `expectAsync(...)`
  - keep the `try/catch`

## When to stop and ask the user

Stop and report if:

- the Step 3 script output is broken or ambiguous
- the user asked to review the patch before apply
- the same file came back and the user asked for review-stop mode
- you cannot tell whether the diff is sandbox-only compatibility cleanup or a real upstream change

## Final reminder

The safe behavior is:

- trust the current Step 3 printed diff
- apply the smallest confirmed sandbox patch
- finish only the same confirmed cleanup category across the current file
- run Prettier on that file
- rerun Step 3
- if the same file comes back, stage it and move on
