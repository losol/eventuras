import { CKEditor } from '@ckeditor/ckeditor5-react';
// import Editor from '@losol/ckeditor5-build-markdown';

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
    <h2>
      CKEditor turned off for now because of typescript error
    </h2>
    // TODO: Fix ts error and uncomment
    // <CKEditor
    //   data={props.data}
    //   onChange={(editor: any) =>
    //     props.onChange(editor.getData())
    //   }
    //   editor={Editor}
    //   config={editorConfiguration}
    // />
  );
};

export default MarkdownEditor;
