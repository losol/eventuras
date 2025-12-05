'use client'

import React from 'react'
import { FieldLabel, useField } from '@payloadcms/ui'

export const PriceField: React.FC = () => {
  const { value, setValue } = useField<number>({ path: 'price.amount' })

  // Convert from minor units (stored) to major units (displayed)
  const [displayValue, setDisplayValue] = React.useState<string>('')

  React.useEffect(() => {
    if (value !== undefined && value !== null) {
      setDisplayValue((value / 100).toString())
    } else {
      setDisplayValue('')
    }
  }, [value])

  const handleBlur = () => {
    if (displayValue === '') {
      setValue(undefined)
      return
    }

    const majorUnits = parseFloat(displayValue)
    if (!isNaN(majorUnits)) {
      const minorUnits = Math.round(majorUnits * 100)
      setValue(minorUnits)
    }
  }

  return (
    <div className="field-type number">
      <FieldLabel label="Price (ex. VAT)" />
      <input
        type="number"
        step="0.01"
        min="0"
        value={displayValue}
        onChange={(e) => setDisplayValue(e.target.value)}
        onBlur={handleBlur}
        placeholder="249.99"
      />
      <div className="field-description">
        Enter price (e.g., 249.99). Stored as minor units internally.
      </div>
    </div>
  )
}
