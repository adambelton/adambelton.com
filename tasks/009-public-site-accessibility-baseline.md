# Task 009 — Public Site Accessibility Baseline

## Status

Complete.

## Goal

Audit and improve the existing public site shell so the website has a small, concrete accessibility baseline before building the ThoughtForm editor UI.

## Scope

- Review existing public site layout and shared site components.
- Ensure semantic landmarks are present: `header`, `nav`, `main`, `footer`.
- Add a skip link if repeated navigation warrants it.
- Confirm visible focus states for links and future interactive controls.
- Check heading structure on current static pages.
- Check meaningful link text on current static pages.
- Add or document an alt text/image policy for future image-led pages.
- Update docs/task/progress files.

## Out Of Scope

- React Aria installation.
- Dialogs, menus, tabs, selects, comboboxes, popovers, or other complex interactive components.
- ThoughtForm editor UI.
- Product-specific UI.
- Visual redesign.
- Automated accessibility tooling.

## Definition Of Done

- Shared site shell uses semantic landmarks.
- Repeated navigation has a skip link.
- Focus states are visible and consistent.
- Existing static pages have sensible heading hierarchy and link text.
- Image/alt text policy is documented for future image-led pages.
- No React Aria dependency is added.
- No product/editor UI is implemented.
- `pnpm typecheck` passes.

## Validation

```txt
pnpm typecheck
```

## Completed Notes

- Added a `SkipLink` component.
- Added `id="main-content"` to current public page `<main>` landmarks.
- Added global `:focus-visible` styles for links and common controls.
- Confirmed current pages already use semantic headings and meaningful link text.
- Documented the React Aria and alt text policy without adding dependencies.
