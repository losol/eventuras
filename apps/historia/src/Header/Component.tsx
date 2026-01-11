import React from 'react'

import { getCurrentWebsite } from '@/lib/website'

import { HeaderClient } from './Component.client'

// Force dynamic rendering to ensure headers are available
export const dynamic = 'force-dynamic'

export async function Header() {
  const website = await getCurrentWebsite()
  const websiteTitle = website?.title || 'Historia'
  return <HeaderClient title={websiteTitle} />
}
