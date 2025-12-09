import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import './App.css'
import './MarkdownEditor.css'

import readmeRaw from '../README.md?raw'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App initialMarkdown={readmeRaw} />
  </React.StrictMode>,
)
