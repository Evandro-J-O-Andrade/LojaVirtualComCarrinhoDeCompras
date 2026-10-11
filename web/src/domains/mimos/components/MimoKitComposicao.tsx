import type { MimoProdutoRef } from '../model/mimo'

interface MimoKitComposicaoProps {
  composicao: MimoProdutoRef[]
}

export function MimoKitComposicao({ composicao }: MimoKitComposicaoProps) {
  if (composicao.length === 0) return null

  return (
    <ul className="mt-5 space-y-3">
      {composicao.map((item) => (
        <li key={item.id} className="flex items-center gap-3">
          {item.imagem ? (
            <img
              src={item.imagem}
              alt=""
              width={48}
              height={48}
              loading="lazy"
              className="h-12 w-12 rounded-lg object-cover"
            />
          ) : null}
          <span className="text-body-sm text-content-muted">{item.nome}</span>
        </li>
      ))}
    </ul>
  )
}
