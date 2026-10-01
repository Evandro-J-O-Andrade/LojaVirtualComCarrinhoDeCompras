import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface SectionHeaderProps {
  title: string
  subtitle?: string
  action?: { label: string; href: string }
  className?: string
}

export function SectionHeader({ title, subtitle, action, className }: SectionHeaderProps) {
  return (
    <div className={cn('flex items-end justify-between mb-8', className)}>
      <div>
        <h2 className="font-display font-bold text-3xl md:text-4xl text-soft-black">
          {title}
        </h2>
        {subtitle && (
          <p className="text-warm-gray mt-2 text-lg">{subtitle}</p>
        )}
      </div>
      {action && (
        <Link
          to={action.href}
          className="hidden md:inline-flex items-center gap-2 text-deep-rose font-medium hover:gap-3 transition-all"
        >
          {action.label}
          <ArrowRight size={18} />
        </Link>
      )}
    </div>
  )
}
