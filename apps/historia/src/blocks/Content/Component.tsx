import React from 'react'
import RichText from '@/components/RichText'

import type { ContentBlock as ContentBlockProps } from '@/payload-types'

export const ContentBlock: React.FC<ContentBlockProps> = (props) => {
  if (!props) return null

  return (
    <div className="container my-16">
        {props.richText && <RichText data={props.richText} enableGutter={false} />}
    </div>
  )
}
