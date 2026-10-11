import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  buildMonthMatrix,
  isPastDate,
  todayInSaoPaulo,
} from '../model/availability'

const WEEKDAY_LABELS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']

interface BookingDateStepProps {
  selected: string | null
  onSelect: (isoDate: string) => void
}

export function BookingDateStep({ selected, onSelect }: BookingDateStepProps) {
  const today = todayInSaoPaulo()
  const [year, setYear] = useState(() => Number(today.slice(0, 4)))
  const [month, setMonth] = useState(() => Number(today.slice(5, 7)) - 1)
  const weeks = buildMonthMatrix(year, month)

  const currentYear = Number(today.slice(0, 4))
  const currentMonth = Number(today.slice(5, 7)) - 1
  const isCurrentMonth = year === currentYear && month === currentMonth

  const previousMonth = () => {
    if (month === 0) {
      setMonth(11)
      setYear(year - 1)
    } else {
      setMonth(month - 1)
    }
  }

  const nextMonth = () => {
    if (month === 11) {
      setMonth(0)
      setYear(year + 1)
    } else {
      setMonth(month + 1)
    }
  }

  const monthLabel = new Date(Date.UTC(year, month, 1))
    .toLocaleDateString('pt-BR', { timeZone: 'UTC', month: 'long', year: 'numeric' })
    .replace(/^\w/, (char) => char.toUpperCase())

  return (
    <div className="surface-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={previousMonth}
          disabled={isCurrentMonth}
          aria-label="Mês anterior"
          className="btn-angel-icon disabled:opacity-40"
        >
          <ChevronLeft size={18} />
        </button>
        <h3 className="font-display font-semibold text-xl text-content">
          {monthLabel}
        </h3>
        <button
          type="button"
          onClick={nextMonth}
          aria-label="Próximo mês"
          className="btn-angel-icon"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {WEEKDAY_LABELS.map((label) => (
          <span
            key={label}
            className="py-1 text-center text-xs font-medium uppercase text-content-subtle"
          >
            {label}
          </span>
        ))}
        {weeks.flat().map((isoDate, index) =>
          isoDate === null ? (
            <span key={`vazio-${index}`} />
          ) : (
            <button
              key={isoDate}
              type="button"
              disabled={isPastDate(isoDate)}
              onClick={() => onSelect(isoDate)}
              aria-pressed={selected === isoDate}
              className={cn(
                'aspect-square rounded-xl text-sm font-medium transition-all',
                'focus-visible:ring-2 focus-visible:ring-primary',
                isPastDate(isoDate) && 'text-content-subtle/50',
                selected === isoDate
                  ? 'bg-primary text-primary-contrast shadow-glow'
                  : isoDate === today
                    ? 'border border-primary text-primary'
                    : 'text-content hover:bg-champagne-light',
              )}
            >
              {Number(isoDate.slice(8, 10))}
            </button>
          ),
        )}
      </div>
    </div>
  )
}
