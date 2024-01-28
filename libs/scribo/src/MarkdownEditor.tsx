"use client";
import "./MarkdownEditor.css";

import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
  TRANSFORMERS,
} from "@lexical/markdown";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { EditorState } from "lexical";
import React, { useState } from "react";

import EditorNodes from "./nodes/EditorNodes";
import ToolbarPlugin from "./plugins/ToolbarPlugin";
import EditorTheme from "./themes/EditorTheme";
import ContentEditable from "./ui/ContentEditable";
import Placeholder from "./ui/Placeholder";

export interface MarkdownEditorProps {
  initialMarkdown?: string;
  className?: string;
  onChange?: (markdown: string) => void;
  onBlur?: () => void;
  placeholder?: string;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = (props) => {
  // eslint-disable-next-line
  const [_isLinkEditMode, setIsLinkEditMode] = useState<boolean>(false);

  const internalOnChange = (editorState: EditorState) => {
    editorState.read(() => {
      const markdown = $convertToMarkdownString(TRANSFORMERS);
      props.onChange && props.onChange(markdown);
    });
  };

  const initialConfig = {
    namespace: "ScriboMarkdown",
    nodes: [...EditorNodes],
    onError: (error: Error) => {
      throw error;
    },
    theme: EditorTheme,
    editorState: () => {
      $convertFromMarkdownString(props.initialMarkdown ?? "", TRANSFORMERS);
    },
  };

  return (
    <div className={props.className}>
      <LexicalComposer initialConfig={initialConfig}>
        <div className="editor-shell" onBlur={props.onBlur}>
          <ToolbarPlugin setIsLinkEditMode={setIsLinkEditMode} />
          <div className="editor-container rich-text">
            <RichTextPlugin
              contentEditable={
                <div className="editor-scroller">
                  <div className="editor">
                    <ContentEditable />
                  </div>
                </div>
              }
              placeholder={<Placeholder>{props.placeholder}</Placeholder>}
              ErrorBoundary={LexicalErrorBoundary}
            />
          </div>
          {props.onChange && <OnChangePlugin onChange={internalOnChange} />}
        </div>
      </LexicalComposer>
    </div>
  );
};

export default MarkdownEditor;
