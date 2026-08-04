# Task 034 manual verification

Verified on 4 August 2026 through the real local client and API hosts with the
configured Neon development database and an authenticated owner session.

## Verified

- The host applied all migrations and loaded the owner-scoped conversation list.
- A retained legacy plain-text Draft loaded as escaped editor content without
  changing its canonical revision or history.
- The semantic editor exposed only the approved block type, strong, emphasis,
  list, link, image-placeholder, undo, and redo controls; source mode and image
  upload were absent.
- The accessibility tree exposed the editor as a named textbox, the toolbar
  controls by role and name, and the Draft as a labelled region.
- Entering the editor moved focus to the editing textbox. The focusable Leave
  draft editor control provided an explicit route back out.
- The product-owned link dialog exposed labelled Link text and Destination
  fields, disabled incomplete submission, and restored focus to Link on cancel.
- An unsaved image placeholder exposed labelled Description, Purpose, Proposed
  alt text, and Caption fields. Reload removed the placeholder, left Save draft
  disabled, and confirmed that canonical owner content was untouched.
- Revision history exposed both retained revisions, source/current state,
  navigation, and a labelled preview. Closing it restored focus to History.

## Environment limitation

The browser accessibility-tree inspection and focus checks passed. A live
macOS VoiceOver speech-output session was not available through the automated
browser surface, so auditory wording and rotor behaviour still require a short
human VoiceOver pass before claiming that specific check.
