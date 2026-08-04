# Semantic editor investigation

## Status

Historical investigation, concluded 4 August 2026. Semantic document formatting
is not part of the current ThoughtForm product direction. This document
records the reasoning and evidence; it is not an implementation specification.

## Question investigated

The existing Draft body was normalized plain text because no product need had
yet justified a richer representation. The investigation asked whether helping
a writer organise a case study or argument implied support for headings, lists,
emphasis, links, code, and image intentions in the drafting experience.

It also considered whether:

- plain text was too weak for an accessibility-focused portfolio product;
- Markdown should become the canonical, stable, model-friendly interchange;
- an editor's private structured state, such as Lexical JSON, should be
  canonical instead;
- Lexical, MDXEditor, Tiptap, or another rich-text engine best fit the product;
- image placeholders could represent publishing intent without adding uploads;
- the private Draft should feed a later CMS or remain directly publishable by
  the owner.

## Reasoning

Structured writing can carry meaning. Headings identify sections, lists express
grouping, quotations distinguish voices, and links establish references. That
made a constrained semantic format more defensible than adding cosmetic rich
text. Markdown appeared attractive because it is stable, portable, readable by
models, and convertible to editor-specific trees without making those trees the
product contract.

The counterargument became more important after examining the complete product
boundary. ThoughtForm's purpose is to help a person discover, test, organise,
and develop their thinking into writing. It is not intended to be a content
management system, publishing surface, layout tool, or general document editor.
The eventual destination already supplies mature document structure, media,
preview, and publication workflows. Recreating a smaller version inside
ThoughtForm adds another editing system and a conversion boundary without
improving the product's core collaboration.

Plain text is not inherently an accessibility compromise when the product
truthfully presents it as plain text. It avoids pretending that visual styling
has semantics, keeps keyboard and screen-reader interaction familiar, and
preserves a narrow canonical representation. Organisation of thought can remain
product meaning—ideas, relationships, inquiry, argument development, ordering,
and prose—without becoming document markup.

## Experiment

An editor spike examined MDXEditor as a replaceable client adapter over
constrained Markdown. The experiment established that:

- Markdown parsing and deterministic serialization were technically feasible;
- editor state did not need to become canonical;
- source mode, arbitrary HTML, and MDX could be withheld;
- custom directives could represent image intentions without uploads;
- built-in link, image, and focus behaviour would need product-owned accessible
  replacements;
- rendered selections and Markdown source occupy different coordinate systems;
- exact selection, proposal replacement, history comparison, paste handling,
  normalization, and accessibility create a much larger product surface than a
  toolbar suggests.

A subsequent implementation attempt confirmed the cost of that surface. It is
documented separately in `semantic-editor-implementation-failure.md`.

## Decision

The canonical Draft remains normalized plain text. The current editor will not
support semantic headings, marks, lists, quotations, links, code, image nodes,
or image placeholders.

ThoughtForm may help organise thinking and arguments through its own product
concepts and conversational behaviour. Document structure and presentation are
left to the destination editor or publishing system the writer already needs.
The owner can continue writing and publishing without adopting a CMS; this
decision neither requires nor prohibits one.

Export remains a later boundary. It should provide the Draft faithfully in a
portable plain-text form and may support destination-specific conversion only
when a concrete export task justifies it. Export must not quietly turn the
private Draft into a document-editor or publishing model.

## Reconsideration threshold

Reconsider semantic Draft structure only if observed product use shows that
plain text prevents users from expressing or reviewing the substance of their
thinking—not merely that formatting would be convenient before publication.
Any future proposal must compare the benefit with using the destination tool,
define the canonical semantics independently of an editor, and budget explicitly
for selection, revision, proposal, paste, accessibility, migration, and export
behaviour.
