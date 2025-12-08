'use client'

import React from 'react'
import { FieldLabel, useField, useFormFields } from '@payloadcms/ui'

import { getCurrency } from '@/currencies'

export const PriceField: React.FC = () => {
  const { value, setValue } = useField<number>({ path: 'price.amountExVat' })
  const currencyField = useFormFields(([fields]) => fields['price.currency'])
  const currencyCode = currencyField?.value as string || 'NOK'
  const currency = getCurrency(currencyCode)
  const decimals = currency?.decimals ?? 2

  // Convert from minor units (stored) to major units (displayed)
  const [displayValue, setDisplayValue] = React.useState<string>('')

  React.useEffect(() => {
    if (value !== undefined && value !== null) {
      const divisor = Math.pow(10, decimals)
      setDisplayValue((value / divisor).toFixed(decimals))
    } else {
      setDisplayValue('')
    }
  }, [value, decimals])

  const handleBlur = () => {
    if (displayValue === '') {
      setValue(undefined)
      return
    }

    const majorUnits = parseFloat(displayValue)
    if (!isNaN(majorUnits)) {
      const multiplier = Math.pow(10, decimals)
      const minorUnits = Math.round(majorUnits * multiplier)
      setValue(minorUnits)
    }
  }

  const step = Math.pow(10, -decimals)

  return (
    <div className="field-type number">
      <FieldLabel label={`Price (ex. VAT) - ${currency?.symbol || ''}`} />
      <input
        type="number"
        step={step}
        min="0"
        value={displayValue}
        onChange={(e) => setDisplayValue(e.target.value)}
        onBlur={handleBlur}
        placeholder={`249${decimals > 0 ? '.99' : ''}`}
      />
      <div className="field-description">
        Enter price (e.g., 249{decimals > 0 ? '.99' : ''}). Stored as minor units ({Math.pow(10, decimals)} {currency?.code || 'units'} = 1 {currency?.symbol || ''}).
      </div>
    </div>
  )
}
