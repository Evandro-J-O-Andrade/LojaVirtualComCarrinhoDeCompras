import { cn } from '@/lib/utils'

interface CategoryCardProps {
  title: string
  description: string
  image: string
  href: string
  color?: string
  className?: string
}

export function CategoryCard({
  title,
  description,
  image,
  href,
  className,
}: CategoryCardProps) {
  return (
    <a
      href={href}
      className={cn(
        'group relative block aspect-[4/5] rounded-2xl overflow-hidden',
        className
      )}
    >
      <img
        src={image}
        alt={title}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-soft-black/80 via-soft-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <h3 className="font-display font-bold text-2xl mb-1">{title}</h3>
        <p className="text-sm text-white/80 mb-3">{description}</p>
        <span className="inline-flex items-center text-sm font-medium text-deep-rose">
          Ver produtos
          <svg className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </span>
      </div>
    </a>
  )
}
