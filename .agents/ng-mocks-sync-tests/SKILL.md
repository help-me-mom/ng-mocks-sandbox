---
name: ng-mocks-sync-tests
description: Use when syncing ng-mocks-sandbox tests/examples from upstream ng-mocks, regenerating e2e.ts, and replaying only sandbox-specific compatibility edits that are still required.
---

# ng-mocks sandbox test sync

Use this skill when updating the `tests` branch from upstream `ng-mocks`.

## Goal

Keep `src/tests`, `src/examples`, and `src/e2e.ts` aligned with upstream while preserving only real sandbox-specific compatibility changes.

This skill is written for lower-reasoning agents. Follow it literally.

## Hard rules

- Use this skill only for the `tests` sync workflow.
- Run repo commands through `core` only:
  - `docker compose run --rm core <command>`
- Do not run host `npm`, host `npx`, host `node`, host `prettier`, or host tests.
- For Step 3 decisions, use only:
  - the current file diff printed by the Step 3 script
  - the normalization rules in this skill
- Do not use `git show`, commit history, upstream tags, or other history lookups to decide a Step 3 patch.
- Patch the current Step 3 file only.
- Patch only the current diff hunk unless this skill explicitly says to finish the same confirmed category across the current file.
- If a diff is not clearly a sandbox-only compatibility case, leave it unchanged.
- Preserve blank lines and simple line shape unless the cleanup itself requires a format change.
- Keep same-line declarations on one line when they still fit after cleanup.
- User instructions override this skill. If the user says "stop after this step" or "show patch before applying", obey that.

## Step 3 only allows 4 actions

During Step 3, the agent may do only these 4 things:

1. Run the Step 3 script.
2. Manually generate and apply a patch for the diff returned by that script.
3. Run Prettier on the current file:
   - `docker compose run --rm core npx prettier --write <current-step3-file>`
4. If the Step 3 script returns the same file again, stage that file with `git add <current-step3-file>`.

Nothing else is allowed during Step 3.

This includes:

- no other terminal commands
- no repo searches
- no extra file inspection to decide the patch
- no tests
- no history lookups
- no git commands of any kind except `git add <current-step3-file>` when the same file comes back

The Step 3 script output is the only diff source for Step 3.

## Source of truth

When Step 3 prints a file:

1. Read only that printed diff first.
2. Decide whether the diff is:
   - upstream-only
   - sandbox compatibility cleanup
   - unclear
3. Apply only the minimum patch needed for confirmed sandbox compatibility cleanup.
4. If the current Step 3 file contains a confirmed forbidden compatibility category from this skill, finish that same category across the current file before moving on.
5. This means:
   - remove the helper block for that forbidden category
   - normalize all visible uses of that forbidden category in the current file
   - do not stop after the first matching hunk if the same category still appears later in the same file
   - keep the replacement in the Jasmine-first style required by this repo
6. Do not "improve" unrelated code in that file.

Important:

- The script decides which file is next.
- The script decides what diff you review.
- Git does not decide the next file.
- Git does not decide the patch shape.
- For every Step 3 file, always report:
  - the repo-relative file name
- Do not print the proposed patch text before applying it.
- If the same file comes back in review-stop mode, print the returned diff for that repeated file and stop.

## Commands

Run bundled scripts like this:

- `docker compose run --rm core sh ./.agents/ng-mocks-sync-tests/scripts/step1_sync_upstream_sources.sh`
- `docker compose run --rm core sh ./.agents/ng-mocks-sync-tests/scripts/step2_regenerate_e2e.sh`
- `docker compose run --rm core sh ./.agents/ng-mocks-sync-tests/scripts/step3_list_changed_synced_files.sh`

Run Prettier like this when it is needed outside Step 3:

- `docker compose run --rm core npx prettier --write <repo-relative-file>`

Examples:

- `docker compose run --rm core npx prettier --write src/tests/mock-render-param-ref/test.spec.ts`
- `docker compose run --rm core npx prettier --write src/examples/TestPipe/test.spec.ts`

## Default workflow

1. Start on branch `tests`.
2. Merge `master` into `tests`.
3. Run Step 1.
4. Run Step 2.
5. Run Step 3.
6. Process Step 3 results one file at a time.
7. When Step 3 returns no file, run final Prettier and tests through `core`.

## Step 3 loop

Treat this as the exact algorithm.

1. Run:
   - `docker compose run --rm core sh ./.agents/ng-mocks-sync-tests/scripts/step3_list_changed_synced_files.sh`
2. If no file is returned, Step 3 is done.
3. If a file is returned, inspect only that printed diff.
4. Prepare a minimal patch using only the current diff plus this skill.
5. Before applying the patch, do a category-completeness check against the printed diff:
   - if the diff shows a property-shim category such as `['standalone' as never ...]`, convert every occurrence of that same property-shim category shown for the current file
   - if the diff shows a forbidden Jest helper category such as `assertion.any(...)` or `typeof jest === 'undefined' ? ...`, convert every occurrence of that same helper category shown for the current file
   - if the diff shows sync `try/catch` blocks used only to assert `error.message`, convert every same-pattern assertion in the current file when the replacement is clearly confirmed by this skill
6. Report only the repo-relative file path before applying it:
   - show the repo-relative file name
7. Do not do anything else besides the 4 allowed Step 3 actions.
8. If the user asked to review patches first:
   - show the file path
   - show the current printed diff
   - stop
9. Otherwise apply the patch.
10. Run:
    - `docker compose run --rm core npx prettier --write <current-step3-file>`
11. Run Step 3 again.
12. Compare the newly returned file name with the previous file name.
13. If the same file comes back:

- default behavior: stage that file and run Step 3 again
- if the user asked for review-stop mode: stop, tell the user the same file came back, and print the current returned diff

13. If a different file comes back, continue the loop.

## What "same file came back" means

It means the Step 3 script returned the same path again after your patch and Prettier run.

- Do not keep reworking the same file forever.
- Do not search history for a better answer.
- Do not do anything else besides the 4 allowed Step 3 actions.
- Follow the default stage-and-move-on rule, unless the user explicitly asked you to stop for review.

## What you may normalize automatically

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
- If one confirmed property-shim cleanup exists in the current Step 3 file, finish the same property-shim category across that file.
- For `['standalone' as never ...]`, scan the whole printed diff for the current file and convert every remaining `false` / `true` occurrence of that same shim in the file before moving on.
- Do not leave a later `['standalone' as never ...]` occurrence behind just because the first patch already touched one earlier hunk.

### Decorator query casts

- `@ContentChild('x', {} as never)` -> `@ContentChild('x')`
- `@ViewChild('x', { read: T } as never)` -> `@ViewChild('x', { read: T })`

Keep same-line declarations on one line when possible.

### Decorator metadata casts

- `@Directive({...} as never)` -> `@Directive({...})`
- same rule for `@Component`, `@Pipe`, and similar metadata decorators

Keep metadata braces intact unless the metadata becomes empty.

### Alias decorator cleanup

- `@Output({ alias: 'x' } as never)` -> `@Output('x')`
- `@Input({ alias: 'x' } as never)` -> `@Input('x')`

If alias metadata has real options like `required`, keep object form and remove only the compatibility cast.

### Version guards

- Remove `VERSION.major` checks when they only preserve older Angular behavior.
- Prefer Angular 21 style in this repo.
- If upstream adds `TestBed.get` / `TestBed.inject` branching, keep `TestBed.inject(...)`.

### Jasmine vs Jest cleanup

This repo prefers Jasmine runtime code.

Do this:

- Keep direct Jasmine expressions in runtime test code.
- If the current Step 3 file contains a forbidden Jest-compatibility helper pattern, remove that helper and finish the same pattern across the whole current file.
- Keep Jest only as adjacent comments when useful.
- If a useful Jest example already exists as a comment, keep that comment exactly as it is and normalize only the live Jasmine code around it.
- Do not rewrite the wording, thrown value, formatting, or placement of an existing Jest example comment just to match another comment shape.
- Do not add a Jest comment for `jasmine.any(...)`, `jasmine.objectContaining(...)`, `jasmine.stringMatching(...)`, or similar Jasmine matcher replacements unless the file already has a useful existing comment to preserve.
- Use inline comment when more code follows on the same line:
  - `output: jasmine.createSpy(), // or jest.fn(),`
- Use next-line comment when the expression is final:
  - `expect(value).toEqual(x);`
  - `// or ...`

Only add or reposition a Jest hint when you are converting a live Jest fallback and there is no existing useful Jest comment to preserve.

Do not do this:

- `typeof jest === 'undefined' ? jasmine.createSpy() : jest.fn()`
- `const assertion: any = typeof jasmine === 'undefined' ? ...`
- `assertion.any(...)`
- `expect.any(...)` used only as a non-Jasmine compatibility fallback

Always normalize these back to the direct Jasmine form in this repo.

Examples:

- if you see this helper:
  - `const assertion: any = typeof jasmine === 'undefined' ? expect : jasmine;`
  - remove the helper block
- if you see this matcher:
  - `expect(value).toEqual(assertion.any(Object));`
  - change to `expect(value).toEqual(jasmine.any(Object));`
- if you see multiple `assertion.any(...)` lines in the same current Step 3 file:
  - change all of them in that file during the same Step 3 patch
- do not add:
  - `expect(value).toEqual(jasmine.any(Object));`
  - `// or expect.any(Object)`
- keep:
  - `const spy = jasmine.createSpy(); // or jest.fn();`
- do not keep:
  - `const spy = typeof jest === 'undefined' ? jasmine.createSpy() : jest.fn();`
- if the file already has:
  - `jasmine.createSpy().and.returnValue('spy'),`
  - `// or jest.fn().mockReturnValue('spy'),`
  - keep those comment lines as-is
- keep:
  - `output: jasmine.createSpy(), // or jest.fn(),`
- do not keep:
  - `output: typeof jest === 'undefined' ? jasmine.createSpy() : jest.fn(),`
- keep:
  - `expect(value).toEqual(jasmine.any(Object));`
- do not keep:
  - `expect(value).toEqual(assertion.any(Object));`

### InjectionToken cleanup

- `new (InjectionToken as any)(...)` -> `new InjectionToken(...)`
- remove adjacent `A5` comments when they only describe that old shim

### RxJS EMPTY cleanup

If upstream reintroduces a local `EMPTY` shim backed by `new Subject(...)`:

- restore the normal `EMPTY` import
- remove the local shim block
- remove `Subject` only if it is unused after cleanup

### RxJS import cleanup

If upstream reintroduces a fallback shim for a normal RxJS export such as `fromEvent`:

- prefer the direct RxJS import over the compatibility shim
- restore the normal import, for example:
  - `import { fromEvent } from 'rxjs';`
- remove the local fallback block such as:
  - `let fromEvent: any;`
  - `try { fromEvent = (rxjs as any).fromEvent; } catch { ... }`
- remove conditional runtime branches that only exist for that fallback shim
- restore the direct subscription / assertion flow once the normal import is back
- do not keep very-old-Angular compatibility polyfills for standard RxJS exports in this repo

### Regex normalization

Regex style is JavaScript/TypeScript style, not Angular-version-specific.

Use one consistent rule in this repo:

- use `new RegExp(...)` for every regex in this repo
- do not use regex literals like `/.../`
- if a regex fix is needed, always prefer `new RegExp(...)`

Prefer this:

- `expect(message).toMatch(new RegExp('Cannot find fail input via ngMocks\\.input'));`
- `expect(fn).toThrowError(new RegExp('Cannot find a TemplateRef via ngMocks\\.findTemplateRef\\(unknownId\\)'));`

Use the same `new RegExp(...)` form for dynamic cases such as:

- `new RegExp(\`No provider( found)? for \\\`?${ProviderService.name}\\\`?\`)`

Do not use regex literals even for static text.

When writing `new RegExp(...)`:

- escape backslashes for the string and for the regex
- escape regex metacharacters inside the string
- if the string contains a single quote or a double quote, prefer template strings
- prefer template strings when they avoid escaping single or double quotes
- use single-quoted strings for static patterns only when no extra quote escaping is needed
- use template strings whenever interpolation is required

If the current Step 3 file contains mixed static regex styles for the same confirmed compatibility-cleanup case, normalize them to this rule in the current file.

### Throw assertion cleanup

Only convert `try/catch` when the block exists only to assert the thrown error.

- sync throw -> `toThrowError(...)`
- async rejection -> `expectAsync(...).toBeRejectedWithError(...)`

Preserve matcher intent:

- exact string checks -> exact string matcher, not `new RegExp(...)`
- partial or regex checks -> `new RegExp(...)` matcher

For exact string matchers:

- prefer single quotes
- if the string contains a double quote, prefer template strings
- do not convert a direct exact string match into `new RegExp(...)`
- example: `expect(fn).toThrowError('Only classes or tokens are accepted');`
- example with double quotes: ``expect(fn).toThrowError(`Cannot parse "value"`);``

Do not force `expectAsync(...)` if it makes the spec clearly worse to read.

## What not to do

- Do not bulk-remove every `as never`.
- Do not rewrite a whole file because one line changed.
- Do not invent plain decorator fields that were not in the current file.
- Do not delete intentional blank lines in specs.
- Do not normalize unrelated upstream changes just because they look noisy.
- Do not use history lookups to justify a Step 3 patch.
- During Step 3, do not do anything besides the 4 allowed actions.

## Fast decision guide

If you see this, do this:

- `['standalone' as never ...]: false`
  - change to `standalone: false`
- `['standalone' as never ...]: true`
  - remove it
- `jasmine.createSpy(), // or jest.fn(),` changed into a `typeof jest` branch
  - restore the Jasmine form with the comment
- `jasmine.any(...)` changed into `assertion.any(...)` or `expect.any(...)`
  - restore `jasmine.any(...)`
- regex literal like `/Cannot find fail input via ngMocks\.input/`
  - change to `new RegExp('Cannot find fail input via ngMocks\\.input')`
- `new (InjectionToken as any)(...)`
  - change to `new InjectionToken(...)`
- `try/catch` used only for `error.message`
  - convert to throw matcher if still readable

## When to stop and ask the user

Stop and report if:

- the Step 3 script output is broken or ambiguous
- the user asked to review the patch before apply
- the same file came back and the user asked for review-stop mode
- you cannot tell whether the diff is sandbox-only or upstream-only

## Final reminder

The safest behavior is:

- trust the Step 3 printed diff
- apply the smallest confirmed sandbox patch
- run Step 3 again
- stop or stage based on the user’s current instruction
