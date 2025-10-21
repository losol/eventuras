import React from 'react'
import clsx from 'clsx'

interface Props {
  className?: string
}

export const Logo = (props: Props) => {
  const { className } = props

  return (
    <p
      className={clsx(
        'inline-flex items-center justify-center max-w-[9.375rem] w-full h-[34px] text-gray-800 dark:text-gray-200',
        className
      )}
    >
      Historia
    </p>
  )
}
