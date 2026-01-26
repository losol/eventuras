import React from 'react'

import { ArchiveBlock } from "@/blocks/ArchiveBlock/Component";
import { ContentBlock } from '@/blocks/Content/Component'
import { FormBlock } from '@/blocks/Form/Component'
import { ImageBlock } from '@/blocks/Image/Component'
import { InstructionBlock } from '@/blocks/InstructionBlock/Component'
import { InstructionSectionBlock } from '@/blocks/InstructionSection/Component'
import { ProductsBlock } from '@/blocks/Product'
import { ResourcesBlock } from '@/blocks/ResourcesBlock/Component'

// Extend block components to include `disableInnerContainer`
const blockComponents: {
  [key: string]: React.FC<any & { disableInnerContainer?: boolean }>
} = {
  archive: ArchiveBlock,
  content: ContentBlock,
  formBlock: FormBlock,
  image: ImageBlock,
  instruction: InstructionBlock,
  instructionSection: InstructionSectionBlock,
  products: ProductsBlock,
  resources: ResourcesBlock,
}

// Define the type for block keys
type BlockType = keyof typeof blockComponents

// Define the type for individual blocks
type Block = {
  blockType: BlockType
  disableInnerContainer?: boolean
} & Record<string, any>

export const RenderBlocks: React.FC<{
  blocks: Block[]
}> = (props) => {
  const { blocks } = props

  if (blocks && blocks.length > 0) {
    return (
      <>
        {blocks.map((block, index) => {
          const { blockType } = block

          if (blockType in blockComponents) {
            const BlockComponent = blockComponents[blockType as BlockType]

            if (BlockComponent) {
              return (
                <div className="my-8" key={index}>
                  <BlockComponent {...block} disableInnerContainer={true}/>
                </div>
              )
            }
          }
          return null
        })}
      </>
    )
  }
  return null
}
