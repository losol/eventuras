'use client'

import React, { useState } from 'react'
import { useSelectedLayoutSegments } from 'next/navigation'
import { useRouter } from 'next/navigation'
import type { PayloadAdminBarProps, PayloadMeUser } from 'payload-admin-bar'
import { PayloadAdminBar } from 'payload-admin-bar'

import { User } from '@/payload-types';
import { cn } from '@/utilities/cn'
import { getClientSideURL } from '@/utilities/getURL'

import './index.scss'

const baseClass = 'admin-bar'

const collectionLabels = {
  pages: {
    plural: 'Pages',
    singular: 'Page',
  },
  articles: {
    plural: 'Articles',
    singular: 'Article',
  },
  cases: {
    plural: 'Cases',
    singular: 'Case',
  },
}

const Title: React.FC = () => <span>Dashboard</span>

export const AdminBar: React.FC<{
  adminBarProps?: PayloadAdminBarProps
}> = (props) => {
  const { adminBarProps } = props || {}
  const segments = useSelectedLayoutSegments()
  const [show, setShow] = useState(false)
  const collectionKeys = ['pages', 'articles', 'cases'] as const;
  type CollectionKey = typeof collectionKeys[number];

  const collection = collectionKeys.includes(segments?.[1] as CollectionKey)
    ? (segments?.[1] as CollectionKey)
    : 'pages';

  const router = useRouter()

  const onAuthChange = React.useCallback((user: PayloadMeUser) => {
    setShow(!!user?.id)
  }, [])

  return (
    <div
      className={cn(baseClass, 'py-2 bg-black text-white', {
        block: show,
        hidden: !show,
      })}
    >
      <div className="container">
        <PayloadAdminBar
          {...adminBarProps}
          className="py-2 text-white"
          classNames={{
            controls: 'font-medium text-white',
            logo: 'text-white',
            user: 'text-white',
          }}
          cmsURL={getClientSideURL()}
          collection={collection}
          collectionLabels={{
            plural: collectionLabels[collection]?.plural || 'Pages',
            singular: collectionLabels[collection]?.singular || 'Page',
          }}
          logo={<Title />}
          onAuthChange={onAuthChange}
          onPreviewExit={() => {
            fetch('/next/exit-preview').then(() => {
              router.push('/')
              router.refresh()
            })
          }}
          style={{
            backgroundColor: 'transparent',
            padding: 0,
            position: 'relative',
            zIndex: 'unset',
          }}
        />
      </div>
    </div>
  )
}
