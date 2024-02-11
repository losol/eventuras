import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
  TRANSFORMERS,
} from "@lexical/markdown";
import {
  $getRoot,
} from 'lexical';
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
import {HistoryPlugin} from '@lexical/react/LexicalHistoryPlugin';
import "./MarkdownEditor.css";
import LinkPlugin from "./plugins/LinkPlugin";
import FloatingLinkEditorPlugin from "./plugins/FloatingLinkEditorPlugin";
import AutoLinkPlugin from "./plugins/AutoLinkPlugin";
import {useSharedHistoryContext} from './context/SharedHistoryContext';

export type onChangeMisc = {
  plainText: string
}
export interface MarkdownEditorProps {
  initialMarkdown?: string;
  className?: string;
  onChange?: (markdown: string, misc: onChangeMisc) => void;
  onBlur?: () => void;
  placeholder?: string;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = (props) => {
  const {historyState} = useSharedHistoryContext();
  const [isLinkEditMode, setIsLinkEditMode] = useState<boolean>(false);

  const [floatingAnchorElem, setFloatingAnchorElem] =
    useState<HTMLDivElement | undefined>(undefined);

  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  };

  const internalOnChange = (editorState: EditorState) => {
    editorState.read(() => {
      const markdown = $convertToMarkdownString(TRANSFORMERS);
      const plainText = $getRoot().getTextContent()
      props.onChange && props.onChange(markdown, { plainText });
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
            <HistoryPlugin externalHistoryState={historyState} />
            <AutoLinkPlugin />
            <LinkPlugin />
            <FloatingLinkEditorPlugin
                  anchorElem={floatingAnchorElem}
                  isLinkEditMode={isLinkEditMode}
                  setIsLinkEditMode={setIsLinkEditMode}
                />
            <RichTextPlugin
              contentEditable={
                <div className="editor-scroller">
                  <div className="editor" ref={onRef}>
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
