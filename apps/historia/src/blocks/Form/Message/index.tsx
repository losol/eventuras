import React from 'react'
import { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

import RichText from '@/components/RichText'

import { Width } from '../Width'

interface MessageProps {
  message: SerializedEditorState
}

export const Message: React.FC<MessageProps> = ({ message }) => {
  return (
    <Width className="my-12" width="100">
      {message && <RichText data={message} />}
    </Width>
  )
}
