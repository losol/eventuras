import clsx from 'clsx'
import React from 'react'

interface Props {
  className?: string
}

export const Logo = (props: Props) => {
  const { className } = props

  return (
    <div
      className={clsx(
        'inline-flex items-center justify-center max-w-[9.375rem] w-full h-[34px] text-gray-800 dark:text-gray-200',
        className
      )}
      role="img"
      aria-label="Losol Logo"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 193 34"
        width="193"
        height="34"
        className="w-full h-full"
      >
        <g fill="none" fillRule="evenodd">
          <text
            x="50%"
            y="50%"
            fill="currentColor"
            fontSize="16"
            fontWeight="bold"
            fontFamily="Arial, sans-serif"
            dominantBaseline="middle"
            textAnchor="middle"
          >
            Losol
          </text>
        </g>
      </svg>
    </div>
  )
}
