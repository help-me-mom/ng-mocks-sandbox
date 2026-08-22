---
name: ng-mocks-sync-tests
description: Use when refreshing the tests branch from the ng-mocks tag pinned in package.json, including e2e regeneration, compatibility cleanup, and optional release handoff.
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
- Keep upstream behavior. Replay only sandbox compatibility edits that are
  still necessary for the Angular version pinned here.
- During the one-file cleanup loop, use only the diff printed by the Step 3
  script. If its classification is unclear, stop and report it.
- Do not edit public documentation as part of the sync. Changes already made
  on `master` may flow through its merge normally.
- User instructions override this skill.

## Workflow

1. Confirm the worktree is clean and the current `tests` and `master` refs are
   suitable for the requested release.
2. Determine the exact target version from `master`, create the clean release
   branch `releases/<version>` from `tests`, and merge `master` into it.
3. Confirm the merged `package.json` pins the same exact version, then import
   its matching tag:

   ```sh
   docker compose run --rm core sh ./.agents/ng-mocks-sync-tests/scripts/step1_sync_upstream_sources.sh
   ```

4. Regenerate the import list:

   ```sh
   docker compose run --rm core sh ./.agents/ng-mocks-sync-tests/scripts/step2_regenerate_e2e.sh
   ```

5. Repeatedly request the next changed file:

   ```sh
   docker compose run --rm core sh ./.agents/ng-mocks-sync-tests/scripts/step3_list_changed_synced_files.sh
   ```

6. When the script prints a file and its diff:
   - classify it as an upstream change, confirmed sandbox cleanup, or unclear;
   - leave upstream changes untouched;
   - for confirmed cleanup, patch only that file and complete only the same
     cleanup category in that file;
   - format it with
     `docker compose run --rm core npx prettier --write <file>`;
   - run Step 3 again;
   - if the same file returns, stage only that file and continue, unless the
     user requested review-stop mode.
7. When no file is returned, run:

   ```sh
   sh ./compose.sh
   docker compose run --rm core npm run prettier:check
   docker compose run --rm core npm run ts:check
   sh ./test.sh
   ```

8. Fix only failures caused by the sync or the Angular version pinned in
   `package.json`, then repeat the relevant checks until they pass.

`test.sh` forwards arguments to `ng test`; it has no special `coverage`
argument. CircleCI's `WITH_COVERAGE=1` environment variable selects the JUnit
reporter in this repository; despite the historical name, it does not enable
Karma code coverage.

## Confirmed compatibility cleanup catalog

Apply a cleanup only when the Step 3 diff proves it is sandbox-only noise.

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
- Use `new RegExp(...)`, not regex literals, for normalized error matchers.
- Convert synchronous `try/catch` blocks used only to inspect
  `error.message` to `toThrowError(...)`. Preserve the original semantics:
  partial checks use regex matching and exact checks stay exact.
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
   confirmed sandbox compatibility fixes.
2. Stage all intended sync files, including `src/e2e.ts`, which is outside the
   Step 3 queue. Do not stage generated reports, caches, credentials, or
   unrelated changes.
3. Keep the merge from `master` separate from the sync commit. Use the
   historical sync message:

   ```text
   feat(ng-mocks): <version> version with latest tests
   ```

4. Push `releases/<version>` and open a ready pull request against `tests`
   using the historical title:

   ```text
   feat(ng-mocks): latest version with latest tests
   ```

5. Preserve the historically empty PR body unless the user asks for an
   explanation or the change needs one. Verify the PR target and checks, and
   do not merge it unless separately requested.
