import React from 'react'
import { cn } from '@/lib/utils'
import { Card } from './Card'

interface StatsGridProps {
  stats: Array<{
    label: string
    value: string | number
    change?: number
    icon: React.ReactNode
  }>
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, i) => (
        <Card key={i}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-warm-gray">{stat.label}</p>
              <p className="font-display font-bold text-3xl text-soft-black mt-2">{stat.value}</p>
              {stat.change !== undefined && (
                <p className={cn('text-sm mt-2', stat.change >= 0 ? 'text-green-600' : 'text-coral')}>
                  {stat.change >= 0 ? '↑' : '↓'} {Math.abs(stat.change)}%
                </p>
              )}
            </div>
            <div className="w-12 h-12 rounded-xl bg-blush flex items-center justify-center text-deep-rose">
              {stat.icon}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}