import React from 'react'
import { SectionHeader } from './SectionHeader'

interface SectionProps {
  title?: string
  subtitle?: string
  action?: { label: string; href: string }
  children: React.ReactNode
  className?: string
}

export function Section({ title, subtitle, action, children, className }: SectionProps) {
  return (
    <section className={className}>
      <div className="container-angel">
        {title && (
          <SectionHeader title={title} subtitle={subtitle} action={action} />
        )}
        {children}
      </div>
    </section>
  )
}