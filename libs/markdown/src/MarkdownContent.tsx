import Markdown from 'markdown-to-jsx'
import { Heading } from '@eventuras/ratio-ui/core/Heading'
import { Text } from '@eventuras/ratio-ui/core/Text'
import { sanitizeMarkdown } from './sanitizeMarkdown'
import { SafeLink, SafeImg } from './SafePrimitives'

export type MarkdownContentProps = {
  markdown?: string | null
  heading?: string
  /** Keep invisible/control characters instead of stripping them. Default: false */
  keepInvisibleCharacters?: boolean
  /** Allow raw HTML in markdown (unsafe). Default: false */
  enableRawHtml?: boolean
}

export const MarkdownContent = ({
                                  markdown,
                                  heading,
                                  keepInvisibleCharacters = false,
                                  enableRawHtml = false,
                                }: MarkdownContentProps) => {
  if (!markdown) return null

  const source = keepInvisibleCharacters ? markdown : sanitizeMarkdown(markdown)

  const options = {
    // only parse HTML when enabled
    disableParsingRawHTML: !enableRawHtml,
    overrides: {
      a: { component: SafeLink as React.FC },
      img: { component: SafeImg as React.FC },
      p: {
        component: Text as React.FC,
        props: { as: 'p', className: 'pb-3' },
      },
    },
  } as const

  return (
    <>
      {heading && <Heading as="h2">{heading}</Heading>}
      <Markdown options={options}>{source}</Markdown>
    </>
  )
}
