import Markdown from 'markdown-to-jsx'
import { Heading } from '@eventuras/ratio-ui/core/Heading'
import { Text } from '@eventuras/ratio-ui/core/Text'
import { sanitizeMarkdown } from './sanitizeMarkdown'
import { SafeLink, SafeImg } from './SafePrimitives'

export type MarkdownContentProps = {
  markdown?: string | null
  heading?: string
  /** Strip invisibles + controls + normalize. Default: true */
  stripInvisible?: boolean
  /** Disable raw HTML in markdown. Default: true */
  disableRawHtml?: boolean
}

export const MarkdownContent = ({
                                  markdown,
                                  heading,
                                  stripInvisible = true,
                                  disableRawHtml = true,
                                }: MarkdownContentProps) => {
  if (!markdown) return null

  const source = stripInvisible ? sanitizeMarkdown(markdown) : markdown

  const options = {
    // block raw HTML passthrough
    disableParsingRawHTML: disableRawHtml,
    // replace anchors/images with safe components
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
