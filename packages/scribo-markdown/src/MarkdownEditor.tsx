import React, { useState } from 'react';
import EditorTheme from './themes/EditorTheme';
import EditorNodes from './nodes/EditorNodes';
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
  TRANSFORMERS,
} from '@lexical/markdown';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import ToolbarPlugin from './plugins/ToolbarPlugin';
import ContentEditable from './ui/ContentEditable';
import Placeholder from './ui/Placeholder';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { EditorState } from 'lexical';
import './MarkdownEditor.css';

export interface MarkdownEditorProps {
  initialMarkdown?: string;
  onChange?: (markdown: string) => void;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = (props) => {
  // eslint-disable-next-line
  const [isLinkEditMode, setIsLinkEditMode] = useState<boolean>(false);

  const internalOnChange = (editorState: EditorState) => {
    editorState.read(() => {
      const markdown = $convertToMarkdownString(TRANSFORMERS);
      props.onChange && props.onChange(markdown);
    });
  };

  const initialConfig = {
    namespace: 'ScriboMarkdown',
    nodes: [...EditorNodes],
    onError: (error: Error) => {
      throw error;
    },
    theme: EditorTheme,
    editorState: () => {
      $convertFromMarkdownString(props.initialMarkdown ?? '', TRANSFORMERS);
    },
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className='editor-shell'>
        <ToolbarPlugin setIsLinkEditMode={setIsLinkEditMode} />
        <div className='editor-container rich-text'>
          <RichTextPlugin
            contentEditable={
              <div className='editor-scroller'>
                <div className='editor'>
                  <ContentEditable />
                </div>
              </div>
            }
            placeholder={<Placeholder>Enter some rich text...</Placeholder>}
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div>
        {props.onChange && <OnChangePlugin onChange={internalOnChange} />}
      </div>
    </LexicalComposer>
  );
};

export default MarkdownEditor;
