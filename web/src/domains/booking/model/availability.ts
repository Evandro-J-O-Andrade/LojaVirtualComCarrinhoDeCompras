export interface TimeSlot {
  inicio: string
  fim: string
}

export type AvailabilityDay =
  | { kind: 'available'; slots: TimeSlot[] }
  | { kind: 'unavailable' }

export type AvailabilityState = { kind: 'unknown' } | AvailabilityDay

export function toISODate(date: Date): string {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function todayInSaoPaulo(): string {
  return new Date().toLocaleDateString('sv-SE', {
    timeZone: 'America/Sao_Paulo',
  })
}

export function isPastDate(isoDate: string): boolean {
  return isoDate < todayInSaoPaulo()
}

export function buildMonthMatrix(year: number, month: number): Array<Array<string | null>> {
  const firstDay = new Date(Date.UTC(year, month, 1))
  const startWeekday = firstDay.getUTCDay()
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
  const cells: Array<string | null> = []
  for (let i = 0; i < startWeekday; i++) cells.push(null)
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(toISODate(new Date(Date.UTC(year, month, day))))
  }
  while (cells.length % 7 !== 0) cells.push(null)
  const weeks: Array<Array<string | null>> = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))
  return weeks
}

export function formatTimeBR(isoDateTime: string): string {
  return new Date(isoDateTime).toLocaleTimeString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDateBR(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString('pt-BR', {
    timeZone: 'UTC',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}
