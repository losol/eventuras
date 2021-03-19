import { CKEditor } from '@ckeditor/ckeditor5-react';
import Editor from '@losol/ckeditor5-build-markdown';
import React from 'react';

const editorConfiguration = {
    toolbar: [
        'heading',
        '|',
        'bold',
        'italic',
        'link',
        'bulletedList',
        'numberedList',
        '|',
        'blockQuote',
        '|',
        'undo',
        'redo',
    ],
};

interface MarkdownEditorProps {
    data: string;
    onChange: (data: string) => void;
}

const MarkdownEditor = (props: MarkdownEditorProps): JSX.Element => {
    return (
        <CKEditor
            data={props.data}
            onChange={(event: Event, editor: Editor) => props.onChange(editor.getData())}
            editor={Editor}
            config={editorConfiguration}
        />
    );
};

export default MarkdownEditor;