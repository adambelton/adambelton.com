import {
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  ButtonWithTooltip,
  directivesPlugin,
  headingsPlugin,
  insertDirective$,
  linkPlugin,
  listsPlugin,
  ListsToggle,
  markdownShortcutPlugin,
  MDXEditor,
  quotePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
  UndoRedo,
  useMdastNodeUpdater,
  usePublisher,
  type DirectiveDescriptor,
  type DirectiveEditorProps,
  type MDXEditorMethods,
} from "@mdxeditor/editor";
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import "@mdxeditor/editor/style.css";

export interface SemanticDraftEditorHandle {
  focus(): void;
  selectedMarkdown(): string;
}

export const SemanticDraftEditor = forwardRef<SemanticDraftEditorHandle, {
  disabled?: boolean;
  markdown: string;
  onChange: (markdown: string) => void;
  onSelectionChange?: () => void;
}>(function SemanticDraftEditor({ disabled = false, markdown, onChange, onSelectionChange }, ref) {
  const editor = useRef<MDXEditorMethods>(null);
  const linkButton = useRef<HTMLButtonElement>(null);
  const linkTextInput = useRef<HTMLInputElement>(null);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkText, setLinkText] = useState("");
  const [linkDestination, setLinkDestination] = useState("");
  const [selectedLinkMarkdown, setSelectedLinkMarkdown] = useState("");
  function openLinkDialog() {
    const selected = editor.current?.getSelectionMarkdown() ?? "";
    const match = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(selected.trim());
    setSelectedLinkMarkdown(selected);
    setLinkText(match?.[1] ?? selected);
    setLinkDestination(match?.[2] ?? "");
    setLinkOpen(true);
  }
  function closeLinkDialog() {
    setLinkOpen(false);
    globalThis.setTimeout(() => linkButton.current?.focus(), 0);
  }
  useEffect(() => {
    if (linkOpen) linkTextInput.current?.focus();
  }, [linkOpen]);
  const plugins = useMemo(() => [
    headingsPlugin({ allowedHeadingLevels: [1, 2, 3, 4] }),
    listsPlugin(),
    quotePlugin(),
    thematicBreakPlugin(),
    linkPlugin(),
    directivesPlugin({ directiveDescriptors: [IMAGE_PLACEHOLDER_DESCRIPTOR] }),
    markdownShortcutPlugin(),
    toolbarPlugin({
      toolbarContents: () => (
        <>
          <UndoRedo />
          <BlockTypeSelect />
          <BoldItalicUnderlineToggles options={["Bold", "Italic"]} />
          <ListsToggle options={["bullet", "number"]} />
          <button onClick={openLinkDialog} ref={linkButton} type="button">Link</button>
          <InsertImagePlaceholder />
        </>
      ),
    }),
  ], []);

  useImperativeHandle(ref, () => ({
    focus: () => editor.current?.focus(),
    selectedMarkdown: () => editor.current?.getSelectionMarkdown() ?? "",
  }), []);

  return (
    <div
      aria-disabled={disabled}
      aria-label="Canonical draft"
      className="semantic-draft-editor"
      onKeyUp={onSelectionChange}
      onMouseUp={onSelectionChange}
    >
      <MDXEditor
        contentEditableClassName="semantic-draft-editor__content"
        markdown={markdown}
        onChange={onChange}
        plugins={plugins}
        readOnly={disabled}
        ref={editor}
        toMarkdownOptions={{ bullet: "-", emphasis: "*", strong: "*", rule: "-" }}
      />
      {linkOpen ? (
        <div aria-labelledby="semantic-link-title" aria-modal="true" className="grid gap-3 border border-[var(--line)] bg-[var(--background)] p-4" role="dialog">
          <h3 id="semantic-link-title">Edit link</h3>
          <label>Link text <input onChange={(event) => setLinkText(event.target.value)} ref={linkTextInput} value={linkText} /></label>
          <label>Destination <input onChange={(event) => setLinkDestination(event.target.value)} placeholder="https://example.com" type="url" value={linkDestination} /></label>
          <div className="flex gap-3">
            <button
              disabled={!linkText.trim() || !linkDestination.trim()}
              onClick={() => {
                editor.current?.insertMarkdown(`[${escapeLinkText(linkText.trim())}](${linkDestination.trim()})`);
                closeLinkDialog();
              }}
              type="button"
            >Save link</button>
            {/^\[[^\]]+\]\([^)]+\)$/.test(selectedLinkMarkdown.trim()) ? (
              <button onClick={() => { editor.current?.insertMarkdown(linkText); closeLinkDialog(); }} type="button">Remove link</button>
            ) : null}
            <button onClick={closeLinkDialog} type="button">Cancel</button>
          </div>
        </div>
      ) : null}
    </div>
  );
});

function escapeLinkText(value: string) {
  return value.replaceAll("[", "\\[").replaceAll("]", "\\]");
}

function ImagePlaceholderEditor({ mdastNode }: DirectiveEditorProps) {
  const updateNode = useMdastNodeUpdater();
  const attributes = mdastNode.attributes ?? {};
  const update = (name: string, value: string) => {
    updateNode({ attributes: { ...attributes, [name]: value } });
  };
  return (
    <fieldset className="grid gap-2 border border-[var(--line)] p-3">
      <legend>Image placeholder</legend>
      <label>Description <input required value={attributes.description ?? ""} onChange={(event) => update("description", event.target.value)} /></label>
      <label>Purpose <input value={attributes.purpose ?? ""} onChange={(event) => update("purpose", event.target.value)} /></label>
      <label>Proposed alt text <input value={attributes.alt ?? ""} onChange={(event) => update("alt", event.target.value)} /></label>
      <label>Caption <input value={attributes.caption ?? ""} onChange={(event) => update("caption", event.target.value)} /></label>
    </fieldset>
  );
}

const IMAGE_PLACEHOLDER_DESCRIPTOR: DirectiveDescriptor = {
  name: "image-placeholder",
  type: "containerDirective",
  attributes: ["description", "purpose", "alt", "caption"],
  hasChildren: false,
  testNode: (node) => node.name === "image-placeholder",
  Editor: ImagePlaceholderEditor,
};

function InsertImagePlaceholder() {
  const insertDirective = usePublisher(insertDirective$);
  return (
    <ButtonWithTooltip
      title="Add image placeholder"
      onClick={() => insertDirective({
        type: "containerDirective",
        name: "image-placeholder",
        attributes: { description: "Describe the intended image", purpose: "", alt: "", caption: "" },
      })}
    >
      Image placeholder
    </ButtonWithTooltip>
  );
}
