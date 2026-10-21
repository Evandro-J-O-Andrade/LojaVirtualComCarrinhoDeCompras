import { useCallback, useState } from 'react'
import { Image as ImageIcon, MoveUpRight, Trash2, Upload, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import type { ProdutoImagem } from '@/domains/produtos/model/produto'

const MIME_PERMITIDOS = new Set([
  'image/webp',
  'image/png',
  'image/jpeg',
  'image/avif',
])
const TAMANHO_MAXIMO = 5 * 1024 * 1024
const MENSAGENS_ERRO = {
  formato: 'Formato não suportado. Use WebP, PNG, JPEG ou AVIF.',
  tamanho: 'Arquivo muito grande. Limite: 5 MB.',
} as const

interface ProdutoImagemUploadProps {
  produtoId: string
  imagensExistentes: ProdutoImagem[]
  podeEditar: boolean
  motivoPermissao?: string
  carregando: boolean
  aoEnviar: (arquivos: File[]) => Promise<void>
  aoRemover: (imagemId: string, url: string) => Promise<void>
  aoTogglePrincipal: (imagemId: string) => Promise<void>
  aoSetCarregando: (carregando: boolean) => void
}

interface ArquivoPrevio {
  id: string
  arquivo: File
  url: string
  valido: boolean
  erro?: string
}

export type ValidacaoArquivo = {
  valido: boolean
  erro?: string
}

export function validarArquivo(arquivo: File): ValidacaoArquivo {
  if (!MIME_PERMITIDOS.has(arquivo.type)) {
    return { valido: false, erro: MENSAGENS_ERRO.formato }
  }
  if (arquivo.size > TAMANHO_MAXIMO) {
    return { valido: false, erro: MENSAGENS_ERRO.tamanho }
  }
  return { valido: true }
}

export function ProdutoImagemUpload({
  imagensExistentes,
  podeEditar,
  motivoPermissao,
  carregando,
  aoEnviar,
  aoRemover,
  aoTogglePrincipal,
  aoSetCarregando,
}: ProdutoImagemUploadProps) {
  const [previos, setPrevios] = useState<ArquivoPrevio[]>([])
  const [erro, setErro] = useState<string | null>(null)

  const criarPreview = useCallback(
    (arquivo: File): ArquivoPrevio => {
      const validacao = validarArquivo(arquivo)
      const url = URL.createObjectURL(arquivo)
      return {
        id: crypto.randomUUID(),
        arquivo,
        url,
        valido: validacao.valido,
        erro: validacao.erro,
      }
    },
    [],
  )

  const processarArquivos = useCallback(
    (arquivos: FileList | null) => {
      if (!arquivos || arquivos.length === 0) return
      const novos = Array.from(arquivos).map(criarPreview)
      const erros = novos.filter((p) => !p.valido)
      if (erros.length > 0) {
        setErro(erros[0]!.erro ?? 'Arquivo inválido.')
        return
      }
      setPrevios((existentes) => [...existentes, ...novos])
      setErro(null)
    },
    [criarPreview],
  )

  const limparPrevios = useCallback(() => {
    previos.forEach((p) => URL.revokeObjectURL(p.url))
    setPrevios([])
  }, [previos])

  const enviar = useCallback(async () => {
    if (previos.length === 0) return
    const invalidos = previos.filter((p) => !p.valido)
    if (invalidos.length > 0) {
      setErro(invalidos[0]!.erro ?? 'Arquivo inválido.')
      return
    }
    const arquivos = previos.map((p) => p.arquivo)
    try {
      aoSetCarregando(true)
      setErro(null)
      await aoEnviar(arquivos)
      limparPrevios()
    } catch (err) {
      setErro(
        err instanceof Error
          ? err.message
          : 'Erro ao enviar imagens. Tente novamente.',
      )
    } finally {
      aoSetCarregando(false)
    }
  }, [previos, aoEnviar, limparPrevios, aoSetCarregando])

  const removerPrevisual = useCallback(
    (id: string) => {
      const previo = previos.find((p) => p.id === id)
      if (previo) URL.revokeObjectURL(previo.url)
      setPrevios((existentes) =>
        existentes.filter((p) => p.id !== id),
      )
    },
    [previos],
  )

  const handleDragOver = useCallback(
    (evento: React.DragEvent) => {
      evento.preventDefault()
      evento.stopPropagation()
    },
    [],
  )

  const handleDrop = useCallback(
    (evento: React.DragEvent) => {
      evento.preventDefault()
      evento.stopPropagation()
      processarArquivos(evento.dataTransfer.files)
    },
    [processarArquivos],
  )

  const imagensOrdenadas = [...imagensExistentes].sort(
    (a, b) => a.ordem - b.ordem,
  )

  const podeAcao = podeEditar && !carregando

  return (
    <div className="space-y-4">
      <div
        className="border-2 border-dashed border-champagne rounded-xl p-6 text-center transition-colors hover:border-deep-rose"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="upload-imagens"
          accept="image/webp,image/png,image/jpeg,image/avif"
          multiple
          disabled={!podeAcao}
          onChange={(evento) =>
            processarArquivos(evento.target.files)
          }
          className="sr-only"
          aria-label="Selecionar imagens"
        />
        <label
          htmlFor="upload-imagens"
          className={cn(
            'flex cursor-pointer flex-col items-center gap-2',
            !podeAcao && 'cursor-not-allowed opacity-60',
          )}
        >
          <Upload size={24} className="text-content-muted" />
          <span className="text-sm font-medium text-soft-black">
            Selecionar imagens
          </span>
          <span className="text-xs text-content-muted">
            WebP, PNG, JPEG ou AVIF — até 5 MB cada
          </span>
        </label>
      </div>

      {!podeEditar && motivoPermissao && (
        <p className="text-xs text-content-muted">
          {motivoPermissao}
        </p>
      )}

      {erro && (
        <div className="flex items-center gap-2 text-sm text-coral">
          <X size={16} />
          <span>{erro}</span>
        </div>
      )}

      {previos.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-soft-black">
            Pré-visualização ({previos.length})
          </h4>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {previos.map((previo) => (
              <div
                key={previo.id}
                className="relative aspect-square rounded-lg overflow-hidden border border-champagne bg-blush"
              >
                <img
                  src={previo.url}
                  alt="Pré-visualização"
                  className="h-full w-full object-cover"
                />
                {!previo.valido && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-xs text-white text-center px-2">
                      {previo.erro}
                    </span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => removerPrevisual(previo.id)}
                  className="absolute top-1 right-1 rounded-full bg-white/80 p-1 text-content-muted hover:text-coral"
                  aria-label="Remover pré-visualização"
                  disabled={!podeAcao}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex justify-end">
            <Button
              variant="primary"
              size="sm"
              onClick={enviar}
              disabled={!podeEditar || carregando || previos.some((p) => !p.valido)}
            >
              {carregando ? 'Enviando...' : 'Enviar imagens'}
            </Button>
          </div>
        </div>
      )}

      {imagensExistentes.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-soft-black">
            Imagens cadastradas
          </h4>
          <ul className="space-y-2">
            {imagensOrdenadas.map((imagem, indice) => (
              <li
                key={imagem.id}
                className="flex items-center gap-3 rounded-lg border border-champagne p-2"
              >
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-blush">
                  {imagem.url ? (
                    <img
                      src={imagem.url}
                      alt={imagem.alt ?? `Imagem ${indice + 1}`}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                      }}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <ImageIcon size={16} className="text-content-muted" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm text-soft-black">
                      {imagem.url}
                    </span>
                    {imagem.principal && (
                      <Badge variant="promo">capa</Badge>
                    )}
                  </div>
                  <span className="text-xs text-content-muted">
                    Ordem: {imagem.ordem}
                  </span>
                </div>
                {podeEditar && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => aoTogglePrincipal(imagem.id)}
                      className="rounded p-1 text-content-muted hover:bg-blush"
                      title={
                        imagem.principal
                          ? 'Desmarcar como principal'
                          : 'Marcar como principal'
                      }
                    >
                      <MoveUpRight size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        aoRemover(imagem.id, imagem.url)
                      }
                      className="rounded p-1 text-content-muted hover:text-coral hover:bg-coral/10"
                      title="Remover imagem"
                      aria-label={`Remover ${imagem.url}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
