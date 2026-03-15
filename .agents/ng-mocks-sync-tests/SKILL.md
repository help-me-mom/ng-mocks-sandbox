---
name: ng-mocks-sync-tests
description: Use when syncing ng-mocks-sandbox tests/examples from upstream ng-mocks, regenerating e2e.ts, and replaying only the sandbox-specific compatibility edits that are still required.
---

# ng-mocks sandbox test sync

Use this skill when updating the `tests` branch from upstream `ng-mocks`.

## Goal

Keep `src/tests`, `src/examples`, and `src/e2e.ts` aligned with upstream `ng-mocks` while preserving only real sandbox-specific deltas.

## Repo command rule

When this repo needs `npm`, `npx`, or `node`, use the Docker Compose wrapper pattern:

`docker compose run --rm --entrypoint sh core -lc "<command>"`

instead of calling those tools directly on the host.

In particular:

- do not run Prettier directly
- do not run tests directly
- do not run ad hoc `node` scripts directly against the repo

Run them through the repo wrapper so execution matches the project container setup.

## Required sequence

1. Start on branch `tests`.
2. Merge `master` into `tests` first. This establishes the current supported `ng-mocks` version in the sandbox.
3. Read the merged version and find the matching upstream `ng-mocks` tag.
4. Replace sandbox `src/tests` and `src/examples` with upstream `tests` and `examples` from that tag.
5. Regenerate `src/e2e.ts` so every kept `.spec.ts` file is listed.
6. Find the previous sandbox commit where upstream specs were added correctly on `tests`.
7. Compare:
   - upstream previous tag `tests`/`examples`
   - sandbox state from that previous good sync
8. Infer the sandbox-only compatibility edits from those diffs.
9. Review the current sandbox git diff file by file and hunk by hunk.
10. Replay only those justified edits onto the newly synced files, preferring hunk-local edits over whole-file rewrites.
11. Run Prettier on the files changed in that batch before moving on, via the Docker Compose wrapper.
12. Re-check the resulting diff for those files and confirm that only intended hunk changes remain.
13. Keep diff noise low: the final diff should mostly reflect true upstream changes plus required sandbox compatibility tweaks.

## Comparison rule

Do not guess compatibility edits from the latest files alone.

Always compare the same file across:

- upstream previous synced tag
- sandbox previous good sync commit

That delta is the source of truth for what the sandbox intentionally patches.

## Diff-first editing rule

When cleaning synced files, prefer the current git diff over whole-file scanning.

For each touched file:

1. compare the working tree file to the committed file
2. inspect only the changed hunks first
3. classify each hunk as:
   - real upstream update
   - sandbox compatibility shim
   - accidental regression introduced during sync or cleanup
4. patch only the lines inside the relevant hunk when possible
5. run Prettier on that file via the Docker Compose wrapper
6. re-check the diff for that file before moving on

Use broader repo-wide searches only to discover categories of leftover noise. Use the diff to decide what to edit.

For recurring code-shape cleanups:

1. search for a likely anchor such as `try {`
2. inspect a 10-15 line diff hunk around each candidate
3. only transform hunks whose old shape and intended new shape are both clear from the diff
4. if a broad search finds a new category, switch back to hunk review before applying the category elsewhere

## Category sweep rule

After the hunk-by-hunk cleanup, do a second pass for each discovered sync-noise category across the whole synced surface, not only the currently changed files.

Examples:

- missing upstream Jest comments near Jasmine spies
- malformed `// or ...` placement
- lost blank-line separation around setup comment blocks
- leftover decorator compatibility shims

For a discovered category:

1. identify one confirmed example by comparing sandbox to upstream
2. search the whole relevant synced area (`src/examples`, `src/tests`, or a smaller subtree) for the same shape
3. compare candidate files to upstream for that category
4. patch every confirmed match, even if the file is not currently in the local git diff

Do not assume “not in the current diff” means “already correct”.

## Normalizations that are usually required

Apply these when they appear as compatibility leftovers rather than true behavior changes.

- Property shims:
  - `['standalone' as never ...]: value` -> `standalone: value`
  - `['imports' as never ...]: value` -> `imports: value`
  - `['hostDirectives' as never ...]: value` -> `hostDirectives: value`
  - remove obsolete metadata leftovers like `['entryComponents' as never /* ... */]: [...]` when they were only Angular-version compatibility shims
- Decorator query casts:
  - `@ContentChild('x', {} as never)` -> `@ContentChild('x')`
  - `@ViewChild('x', { read: T } as never)` -> `@ViewChild('x', { read: T })`
  - same idea for `@ContentChildren`, `@ViewChildren`, and similar decorators
- Decorator metadata casts:
  - `@Directive({...} as never)` -> `@Directive({...})`
  - same idea for `@Component`, `@Pipe`, and similar metadata decorators
- Decorator API normalizations:
  - keep Angular-16+ object form for `@Input({...})` when upstream uses it
  - normalize `@Output({ alias: 'x' })` to `@Output('x')` for the sandbox Angular version
- Version guards:
  - remove `VERSION.major` checks and their imports when they only gate behavior for older Angular versions
  - `ng-mocks-sandbox` runs on one Angular version, so runtime version branching is usually noise here
- Jest branching in sandbox specs:
  - start from the upstream hunk, not from a generic formatting preference
  - if the upstream hunk contains a Jest branch or Jest comment, preserve a Jest comment in the sandbox result unless the previous good sandbox diff proves that this repo intentionally removes it
  - remove live `typeof jest` branches and `if (typeof jest ...)` branches from sandbox specs
  - keep the Jasmine expression in code
  - keep Jest only as a nearby comment when the comment helps show the equivalent Jest API
  - preserve upstream comment style when it is already clear and harmless
  - declaration/setup examples like `const writeValue = jasmine.createSpy(...)` may keep:
    `// in case of jest`
    `// const writeValue = jest.fn();`
    instead of forcing `// or ...`
  - the same block form applies to local setup inside factories or providers, for example:
    `const fn = jasmine.createSpy();`
    `// in case of jest`
    `// const fn = jest.fn();`
    `fn.hello = jasmine.createSpy();`
    `// in case of jest`
    `// fn.hello = jest.fn();`
  - object-literal spy properties and standalone reset statements should usually keep the upstream next-line block form too
  - preserve the original comment shape from the committed/upstream hunk:
    - if the property or statement previously used an inline Jest hint like `jasmine.createSpy(), // or jest.fn(),`, keep it inline
    - do not rewrite an existing inline hint into a separate block unless the baseline hunk already used the block form
  - examples:
    `output1: jasmine.createSpy('output1'),`
    `// in case of jest`
    `// output1: jest.fn().mockName('output1'),`
    `(params.output1 as jasmine.Spy).calls.reset();`
    `// in case of jest`
    `// (params.output1 as jest.Mock).mockReset();`
  - preserve surrounding blank lines when those comment blocks intentionally separate setup from the next explanatory block
  - after a multi-line Jest comment block, preserve the trailing blank line if upstream uses it before the next active statement
  - keep formatting inside Jest comment examples consistent too: if the comment shows a multi-line call or object literal, indent it like real code rather than leaving ragged spacing
  - if the Jasmine expression is the final argument / final expression, place the Jest hint on the next line as `// or ...`
  - if more real arguments or properties follow, keep the Jest hint inline on the same line as the Jasmine expression so the comment does not split the call / object structure
  - for `ngMocks.stubMember(...)` this usually means:
    - final spy argument:
      `ngMocks.stubMember(obj, 'x', jasmine.createSpy(),`
      `// or jest.fn(),`
      `)`
    - more args after the spy:
      `ngMocks.stubMember(obj, 'x', jasmine.createSpy(), // or jest.fn(), 'get')`
  - the same idea applies to other helper calls like `MockInstance(...)`, `MockRender(...)` setup spies, property assignments, and local spy declarations: preserve the upstream Jest hint, then normalize only the runtime branch itself
  - when upstream branches on Jasmine-vs-Jest spy internals, keep the active Jasmine call and preserve the Jest access path as a nearby comment
  - remove matcher-bridge helpers created only to support both Jest and Jasmine, for example:
    `const assertion = typeof jasmine === 'undefined' ? expect : jasmine`
    and replace their usages with direct Jasmine matchers in sandbox code
  - example:
    `ngMocks.stub<any>(mock, 'registerOnTouched').calls.first().args[0]();`
    `// in case of jest`
    `// ngMocks.stub<any>(mock, 'registerOnTouched').mock.calls[0][0]();`
- Injectable compatibility helpers:
  - remove helper spreads such as `...injectableArgs`
  - inline normal decorator metadata when that was the older sandbox patch
- InjectionToken compatibility helpers:
  - `new (InjectionToken as any)(...)` -> `new InjectionToken(...)`
  - remove adjacent `A5` / `Remove any with A5` comments when they only explain that constructor shim
- Old Angular compatibility comments/helpers:
  - remove obsolete `A5`-style comments or helper code when the previous sandbox diff shows they were temporary shims
  - remove obsolete RxJS / Angular compatibility shims like dynamic `fromEvent` lookup via namespace access and `try/catch` when the current sandbox supports direct imports
  - replace obsolete `TestBed.get(...)` usage with `TestBed.inject(...)` for the sandbox Angular version
  - do not rewrite ordinary prose comments while normalizing code; only change comments when they are:
    - obsolete compatibility notes
    - Jest guidance comments intentionally derived from an upstream Jest branch
    - wording that the upstream diff itself changed
- Standalone declaration noise:
  - remove `standalone: true` from declaration metadata when it is obsolete for the sandbox
  - keep the metadata object intact after removal
  - if removal leaves an empty metadata object, collapse to `@Directive()`, `@Component()`, or `@Pipe()`
- Throw assertions:
  - when a diff hunk is only using `try/catch` to assert `error.message`, normalize it
  - for a synchronous throwing call, prefer:
    `expect(() =>`
    `  doThing()`
    `).toThrowError(...)`
  - if the throwing body contains multiple statements or `if/else`, use a block arrow:
    `expect(() => {`
    `  doThing();`
    `}).toThrowError(...)`
  - if the awaited call is the part that rejects, prefer:
    `await expectAsync(doThingAsync()).toBeRejectedWithError(...)`
  - if async setup succeeds but a later synchronous call throws, await the setup first and then use `toThrowError` for the sync call
  - readability exception: if `expectAsync(...)` makes the async spec noticeably less readable, keep the original `try/catch`
  - if the original async spec keeps setup and the throwing call together inside one `try` block, preserve that structure instead of pulling the throwing call outside just to use `toThrowError(...)`
  - preserve the original matcher semantics during conversion:
    - original `toContain(...)`: use a regex-based throw matcher
    - original `toEqual(...)` or an existing exact throw matcher: keep an exact string matcher
    - original `toMatch(...)` or an existing regex throw matcher: keep a regex matcher
  - for Angular DI errors in the sandbox, prefer tolerant regexes that match both older and Angular 21 wording, for example:
    `new RegExp(\`No provider( found)? for \\`?${TokenName}\\`?\`)`instead of brittle patterns like`No provider for X`or`-> X`
  - prefer `toThrowError(new RegExp(...))` over exact-string `toThrowError('...')` only for former `toContain(...)` assertions
  - escape regex metacharacters in plain text like `.`, `$`, `(`, `)` when building a regex from a former `toContain(...)` assertion
  - do not rewrite cases that assert the whole error object rather than `error.message`

## Guardrails

- Do not bulk-remove every `as never`.
- Only normalize `as never` when it is part of a compatibility shim in decorator metadata, decorator query options, or the previous sandbox sync delta.
- Do not strip decorator object braces by accident.
  - Wrong: `@Directive(\n  selector: 'host'\n)`
  - Correct: `@Directive({\n  selector: 'host',\n})`
- After removing `standalone: true`, keep the metadata object shape valid.
  - Wrong: `@Component(\n  selector: 'x'\n)`
  - Correct: `@Component({\n  selector: 'x',\n})`
- Do not leave runtime Jest/Jasmine branching in sandbox code.
  - Wrong: `typeof jest === 'undefined' ? jasmine... : jest...`
  - Correct: Jasmine code in the test, optional Jest equivalent as a comment
- Do not place the Jest hint on the wrong statement after moving it.
  - Wrong:
    `calls.reset();`
    `emit(); // or mockReset()`
  - Correct:
    `calls.reset(); // or mockReset()`
    `emit();`
- Preserve upstream formatting as much as possible.
- After each edit batch, run Prettier via the Docker Compose wrapper before doing the next diff review.
- Prefer hunk-local edits to whole-file rewrites.
- After each patch, re-read the diff for the edited file instead of trusting the rewrite blindly.
- Keep non-compatibility test logic unchanged unless the previous sandbox delta proves it must be patched.

## Lessons from previous mistakes

- Right:
  - compare against the previous good sandbox sync before normalizing
  - use current git diff hunks as the main editing surface
  - after finding one bad category, sweep the whole synced area for other files with the same upstream-vs-sandbox regression
  - remove compatibility shims, not real behavior
  - keep Jasmine as the active runtime in sandbox tests
  - run Prettier after each batch so accidental formatting regressions surface early
- Wrong:
  - assuming the current working-tree diff is the whole problem space
  - rewriting whole files when only one diff hunk needs cleanup
  - replacing fields without preserving surrounding decorator object braces
  - stopping after property shim cleanup and missing decorator/query shim cleanup
  - leaving live Jest branches in files that should now be Jasmine-only
  - trusting grep hits without checking whether the pattern is part of a real compatibility delta

## e2e.ts rule

After the final kept spec set is decided, update `src/e2e.ts` from the actual current file list, not from the upstream list before sandbox filtering.

## Useful verification greps

Use targeted greps to catch leftover compatibility noise:

- `VERSION.major`
- `\\['standalone' as never`
- `\\['imports' as never`
- `\\['hostDirectives' as never`
- decorator `{} as never`
- decorator `} as never)`
- `standalone: true`
- `typeof jest`

Do not treat grep output alone as permission to rewrite unrelated test logic. Use the previous good sandbox sync diff as the deciding reference.
