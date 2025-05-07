import { useState } from 'react'
import MarkdownEditor from './MarkdownEditor'

interface Props {
  /** Initial markdown string */
  initialMarkdown: string
}

/**
 * Wraps editor + rendered output
 * @see {@link Props}
 */
export function App({ initialMarkdown }: Readonly<Props>) {
  // State for current markdown
  const [markdown, setMarkdown] = useState<string>(initialMarkdown)

  // Handle editor changes
  const onChange = (newMd: string) => setMarkdown(newMd)

  return (
    <div className="App">
      <h1>Scribo Markdown editor</h1>

      <div className="editor-container">
        {/* Editor panel */}
        <div className="markdown-editor">
          <h2>Edit content</h2>
          <MarkdownEditor
            initialMarkdown={markdown}
            onChange={onChange}
          />
        </div>

        {/* Rendered output */}
        <div className="markdown-output">
          <h2>See the markdown output</h2>
          <pre>{markdown}</pre>
        </div>
      </div>
    </div>
  )
}
