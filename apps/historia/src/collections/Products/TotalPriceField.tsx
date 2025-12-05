'use client'

import React from 'react'
import { useFormFields } from '@payloadcms/ui'

export const TotalPriceField: React.FC = () => {
  const amount = useFormFields(
    ([fields]) => fields['price.amount']?.value as number | undefined,
  )
  const vatRate = useFormFields(
    ([fields]) => fields['price.vatRate']?.value as number | undefined,
  )

  const totalPrice = React.useMemo(() => {
    const amountValue = amount || 0
    const vatRateValue = vatRate ?? 25
    return Math.round(amountValue * (1 + vatRateValue / 100))
  }, [amount, vatRate])

  // Format for display (convert from minor units to major units)
  const displayPrice = (totalPrice / 100).toFixed(2)

  return (
    <div className="field-type">
      <label className="field-label">Total Price (inc. VAT)</label>
      <div className="rounded border border-gray-300 bg-gray-100 px-3 py-2 text-sm font-medium">
        {displayPrice}
      </div>
      <div className="field-description mt-1">
        Calculated total price including VAT (updates automatically)
      </div>
    </div>
  )
}
