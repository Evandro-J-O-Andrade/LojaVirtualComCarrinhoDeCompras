import React from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, id, className, ...props }: InputProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-warm-gray">
          {label}
        </label>
      )}
      <input
        id={id}
        className={cn(
          'w-full px-4 py-2.5 rounded-lg border-2 border-champagne bg-ivory focus:outline-none focus:border-deep-rose transition-colors',
          error && 'border-coral focus:border-coral',
          className
        )}
        {...props}
      />
      {error && <p className="text-sm text-coral">{error}</p>}
    </div>
  )
}