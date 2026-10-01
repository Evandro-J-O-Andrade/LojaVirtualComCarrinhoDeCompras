import { Bell, Search, Menu } from 'lucide-react'
import { Button } from '@/components/common/Button'

interface AdminHeaderProps {
  onMenuClick?: () => void
}

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  return (
    <header className="bg-white border-b border-champagne sticky top-0 z-30">
      <div className="flex items-center justify-between h-16 px-6">
        <div className="flex items-center gap-4">
          <Button
            variant="icon"
            className="lg:hidden"
            onClick={onMenuClick}
          >
            <Menu size={20} />
          </Button>
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-gray" />
            <input
              type="text"
              placeholder=" buscar..."
              className="pl-10 pr-4 py-2 rounded-lg border-2 border-champagne bg-ivory focus:outline-none focus:border-deep-rose w-64"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="icon">
            <Bell size={20} />
          </Button>
          <div className="flex items-center gap-3 ml-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-deep-rose to-coral flex items-center justify-center text-white font-medium">
              A
            </div>
            <span className="font-medium text-soft-black hidden md:block">Admin</span>
          </div>
        </div>
      </div>
    </header>
  )
}
