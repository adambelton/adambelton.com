# Link writing to ThoughtForm

## Goal

Give website and DEV readers an immediate route from each existing article to
the ThoughtForm product page.

## Why this task is next

The first DEV publication showed that readers encounter ThoughtForm without the
portfolio context needed to understand or inspect the product.

## Scope

- Link the first body-text mention of ThoughtForm in each article to
  `https://adambelton.com/products/thoughtform`.
- Validate website rendering and synchronize both live DEV articles.
- Prove the final live synchronization is idempotent.

## Out of scope

- Linking every mention or changing article prose, descriptions, tags, or the
  product page.
- Adding promotional calls to action.

## Expected files to create or modify

- both existing files under `apps/client/src/content/posts`
- `progress.md`
- this task record

## Definition of done

- Each article's first body-text ThoughtForm mention links to the absolute
  product URL on the rendered website and DEV.
- Canonical URLs and tags remain unchanged.
- Tests, client build, dry run, live synchronization, final unchanged run, and
  diff checks pass.

## Validation commands

```txt
pnpm test
pnpm --filter @adambelton/client build
pnpm syndicate:dev-to --dry-run
pnpm syndicate:dev-to
pnpm syndicate:dev-to
git diff --check
```

## Risks / questions

- The product link is contextual and relevant, but repeated linking would make
  the articles unnecessarily promotional and visually noisy.

## Approval record

Approved by Adam on 15 August 2026.

- **Intentional boundary:** link only the first body-text mention in each post.
- **Important deferrals:** repeated links, calls to action, and copy changes.
- **Implementation decision:** use the absolute production product URL so the
  same Markdown works on the website and DEV.
- **Do not reopen without new evidence:** article metadata and tags remain
  unchanged.

## Status

Complete on `codex/dev-to-syndication`; not yet committed, pushed, or merged.

## Completion audit

- **Contextual links:** the first body-text ThoughtForm mention in each existing
  post links to `https://adambelton.com/products/thoughtform`. Inspection of the
  production client bundle found exactly two occurrences of that absolute URL,
  one for each post.
- **Live DEV result:** authenticated reads of DEV articles `4402230` and
  `4402231` found exactly one matching ThoughtForm link in each article. Their
  approved canonical URLs and external tag sets remained unchanged.
- **Idempotency:** the first live synchronization updated both existing articles
  by canonical URL. The immediately repeated synchronization returned
  `unchanged` for both, without creating duplicates.
- **Automated validation:** all 380 tests passed with 16 intentionally skipped;
  the client production build, two-post dry run, and final `git diff --check`
  passed.
- **Branch audit:** the complete branch diff changes article prose only by adding
  the approved contextual links. It introduces no new ownership boundary,
  product behaviour, persistence, migration, prompt, or mounted-flow change,
  and leaves the earlier approved syndication metadata and implementation
  decisions intact.
