import { cn } from '@/lib/utils'

interface HeroProps {
  title: string
  subtitle: string
  image: string
  primaryLabel?: string
  primaryHref?: string
  secondaryLabel?: string
  secondaryHref?: string
  className?: string
}

export function Hero({
  title,
  subtitle,
  image,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
  className,
}: HeroProps) {
  return (
    <section className={cn('relative min-h-dvh flex items-center', className)}>
      <div className="container-angel">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="font-display font-bold text-5xl md:text-6xl lg:text-7xl text-soft-black leading-tight">
              {title}
            </h1>
            <p className="text-warm-gray text-lg md:text-xl max-w-lg">
              {subtitle}
            </p>
            <div className="flex flex-wrap gap-4">
              {primaryLabel && primaryHref && (
                <a
                  href={primaryHref}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-deep-rose text-white font-medium text-lg hover:bg-rose transition-all shadow-lg hover:shadow-xl"
                >
                  {primaryLabel}
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </a>
              )}
              {secondaryLabel && secondaryHref && (
                <a
                  href={secondaryHref}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full border-2 border-champagne text-soft-black font-medium text-lg hover:border-deep-rose hover:bg-blush transition-all"
                >
                  {secondaryLabel}
                </a>
              )}
            </div>
          </div>
          <div className="relative aspect-square lg:aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

