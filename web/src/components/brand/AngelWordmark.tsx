interface AngelWordmarkProps {
  /** Tom sobre fundo escuro (cinema) ou sobre fundo claro (shell). */
  tone?: 'inverted' | 'default'
  as?: 'h1' | 'h2' | 'p' | 'span' | 'div'
  className?: string
}

/**
 * Lockup da marca. Sempre o nome completo — "Angel Cosméticos".
 * Não existe variante "só Angel" para uso institucional.
 */
export function AngelWordmark({
  tone = 'default',
  as: Tag = 'span',
  className = '',
}: AngelWordmarkProps) {
  const inverted = tone === 'inverted'

  return (
    <Tag
      className={['angel-wordmark', inverted ? 'angel-wordmark--inverted' : '', className]
        .filter(Boolean)
        .join(' ')}
    >
      <span className="angel-wordmark__name">Angel</span>
      <span className="angel-wordmark__sub">Cosméticos</span>
    </Tag>
  )
}
