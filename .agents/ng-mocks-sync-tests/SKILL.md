---
name: ng-mocks-sync-tests
description: Use when refreshing the tests branch from the ng-mocks tag pinned in package.json, including batched compatibility cleanup, e2e regeneration, validation, and optional release handoff.
---

# Sync ng-mocks tests into the sandbox

Use this workflow for an update destined for `tests`. Work on a release branch
based on `tests`; do not run the destructive import on `master`. The workflow
replaces `src/tests` and `src/examples` with the sources from the upstream tag
matching the exact `ng-mocks` version in `package.json`.

## Safety rules

- Start from current `tests` and `master` refs with a clean worktree.
- Read the target version from the exact `ng-mocks` dependency on `master`,
  then create `releases/<version>` from `tests` and merge `master` into it.
- Do not overwrite an existing release branch. Inspect it and ask before
  reusing it.
- After the merge, verify that `package.json` still pins that exact version.
- Run npm, npx, Node, formatting, and tests through `core`, never on the host.
- Keep effective upstream test behavior. Preserve an established destination
  simplification from `origin/tests` when it still exercises the same result
  under the versions pinned here; do not replace it merely to mirror upstream
  syntax. Replay only sandbox compatibility edits that are still necessary.
- Patch synced source files locally in logical batches. Do not start a Docker
  container merely to format or inspect each file.
- Do not use the full browser suite as a per-file feedback loop. Settle the
  complete imported diff before starting consolidated validation.
- Classify every changed hunk before staging it. If a classification is
  unclear, leave it unstaged and stop to report it.
- Do not edit public documentation as part of the sync. Changes already made
  on `master` may flow through its merge normally.
- User instructions override this skill.

## Workflow

1. Confirm the worktree is clean, then refresh the public upstream refs before
   making branch or version decisions:

   ```sh
   git fetch https://github.com/help-me-mom/ng-mocks-sandbox.git \
     master:refs/remotes/origin/master \
     tests:refs/remotes/origin/tests
   ```

2. Determine the target version from `origin/master`. Require a concrete,
   published version with no range operator, tag, or workspace protocol; do
   not rely on the import script to normalize a non-exact dependency. Create
   the clean release branch `releases/<version>` from `origin/tests`, then
   merge `origin/master` into it.
3. Confirm the merged `package.json` pins the same exact version, then import
   its matching tag:

   ```sh
   docker compose run --rm core sh ./.agents/ng-mocks-sync-tests/scripts/step1_sync_upstream_sources.sh
   ```

4. Regenerate the import list:

   ```sh
   docker compose run --rm core sh ./.agents/ng-mocks-sync-tests/scripts/step2_regenerate_e2e.sh
   ```

5. Build the cleanup queue locally:

   ```sh
   git status --short -- src/tests src/examples src/e2e.ts
   ```

6. Review complete diffs in logical batches with `git diff -- <files>`:
   - classify each hunk as an upstream change, confirmed sandbox cleanup, or
     unclear;
   - for existing files, distinguish a real release behavior change from the
     import merely overwriting a prior destination simplification; consult the
     upstream tag-to-tag diff or history when the distinction is unclear;
   - restore the destination form exactly when its simpler representation
     still asserts the same behavior under the pinned sandbox;
   - patch all confirmed instances of the same cleanup category across the
     full changed set, without broadening beyond imported paths;
   - stage reviewed upstream changes and necessary compatibility adaptations;
   - leave unclear files unstaged;
   - do not format after each file.

   `git diff` does not show untracked additions. Inspect every new file listed
   by `git status` directly or with `git diff --no-index -- /dev/null <file>`.

7. Use the cheap Step 3 script directly on the host as the final unstaged-file
   queue:

   ```sh
   sh ./.agents/ng-mocks-sync-tests/scripts/step3_list_changed_synced_files.sh
   ```

   This is a final audit, not the primary review loop. If it exposes many
   files, return to the batched review; otherwise classify, fix, or stage the
   printed file and repeat until it prints nothing. Before starting Docker,
   also inspect changed Jasmine labels:

   ```sh
   git diff --cached -U0 -- src/tests src/examples \
     | rg "^[+-].*\\b(describe|it)\\("
   ```

   Restore a prior label only when the imported label clearly duplicates a
   sibling in the same Jasmine parent, contradicts the API or fixture under
   test, or is confirmed to abort this sandbox's suite. Do not discard a real
   upstream rename merely because the same short label exists elsewhere.

8. Confirm `src/e2e.ts` imports every synced `*.spec.ts` exactly once, including
   new files. Then set up once, format all staged files together, review and
   stage any formatter delta, and run the static checks together:

   ```sh
   sh ./compose.sh
   docker compose run --rm core sh -eu -c \
     'git diff --cached --name-only --diff-filter=ACMR -z | xargs -0 -r npx prettier --write'
   docker compose run --rm core sh -eu -c \
     'npm run prettier:check && npm run ts:check'
   sh ./test.sh
   ```

9. Fix only failures caused by the sync or the Angular version pinned in
   `package.json`. Before rerunning the full suite, find and fix every reviewed
   occurrence of the same failure category. For example, if Jasmine aborts on
   a duplicate changed label, inspect all imported label changes first; if a
   declaration-order-only change causes a pinned-Angular runtime failure,
   restore the known-good order after confirming the cause. Then repeat the
   relevant checks once.

`test.sh` forwards arguments to `ng test`; it has no special `coverage`
argument. On `tests`, `src/e2e.ts` imports the full suite, so `--include` may
still execute every imported spec and should not be treated as a speedup.
CircleCI's `WITH_COVERAGE=1` environment variable selects the JUnit
reporter in this repository; despite the historical name, it does not enable
Karma code coverage.

## Confirmed compatibility cleanup catalog

Apply a cleanup only when the reviewed synced diff proves it is sandbox-only
noise.

- Replace computed Angular metadata shims such as
  `['standalone' as never]: false` with `standalone: false`; remove obsolete
  `standalone: true` and `entryComponents` shims without dropping metadata
  braces that still contain real fields.
- Remove obsolete `as never` casts from decorator metadata and query options.
- Use direct Jasmine runtime helpers. Keep a useful Jest alternative only as
  an adjacent `// or ...` comment.
- Replace `new (InjectionToken as any)(...)` with `new InjectionToken(...)`
  and remove an adjacent Angular 5 comment when it only explains the shim.
- Restore direct RxJS exports such as `EMPTY`, `NEVER`, and `fromEvent` instead
  of local compatibility fallbacks.
- Prefer the established destination matcher when it remains behaviorally
  equivalent for the actual value exercised by the test. Use `new RegExp(...)`
  only when interpolation plus materially partial or variable matching needs
  it; do not introduce it merely because upstream expresses the same current
  assertion with a regex or `.toContain(...)`.
- Convert synchronous `try/catch` blocks used only to inspect
  `error.message` to `toThrowError(...)`. First retain an existing destination
  matcher when it remains valid. For a new conversion, preserve material
  semantics: partial checks use regex matching and exact checks stay exact.
- Keep an async `try/catch` when conversion would make the spec less readable
  or would move setup and the throwing call out of the same block.
- Prefer `TestBed.inject(...)` when an old-version guard chooses between it
  and `TestBed.get(...)`.

Do not use this catalog for unrelated refactors, comment rewrites, or genuine
upstream behavior changes.

## Release handoff

A validated working tree is the default stopping point. Do not create the sync
commit, push, or open a pull request unless the user explicitly asks to
finalize or publish the release update. A direct request to open the pull
request authorizes its required sync commit and push, but not merging it.

When release handoff is authorized:

1. Review the complete diff against `tests`. Include only the merge from
   `master`, the imported upstream sources, the generated `src/e2e.ts`, and
   confirmed sandbox compatibility fixes. If the user explicitly requested a
   workflow-skill or agent-instruction update, keep it in a separate docs
   commit in the same PR rather than folding it into the sync commit.
2. Stage all intended sync files, including `src/e2e.ts`, which is outside the
   Step 3 queue. Do not stage generated reports, caches, credentials, or
   unrelated changes.
3. Immediately before the sync commit, refresh both upstream refs and verify
   that they are ancestors of the release branch:

   ```sh
   git fetch https://github.com/help-me-mom/ng-mocks-sandbox.git \
     master:refs/remotes/origin/master \
     tests:refs/remotes/origin/tests
   git merge-base --is-ancestor origin/master HEAD
   git merge-base --is-ancestor origin/tests HEAD
   ```

   If either ref advanced, integrate it and repeat the affected import or
   validation work before publishing. If refreshed `master` pins a different
   ng-mocks version, do not keep working under the old release branch name;
   stop and restart from current `tests`, or ask how to preserve the old work.

4. Keep the merge from `master` separate from the sync commit. Use the
   historical sync message:

   ```text
   feat(ng-mocks): <version> version with latest tests
   ```

5. Push `releases/<version>` and open a ready pull request against `tests`
   using the historical title:

   ```text
   feat(ng-mocks): latest version with latest tests
   ```

6. Preserve the historically empty PR body unless the user asks for an
   explanation or the change needs one. Verify the PR target and checks, and
   do not merge it unless separately requested.
