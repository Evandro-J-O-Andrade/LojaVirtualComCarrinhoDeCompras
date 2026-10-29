import { useRef, useState, type ChangeEvent } from 'react'
import { Camera, UserRound } from 'lucide-react'
import { toast } from 'sonner'
import { useAccount } from '@/domains/conta/context/AccountContext'
import { supabase } from '@/lib/supabase'

const TIPOS_IMAGEM: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
}
const TAMANHO_MAXIMO = 2 * 1024 * 1024

export function AdminAvatar() {
  const { user, profile } = useAccount()
  const inputRef = useRef<HTMLInputElement>(null)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const nome = profile?.nome || profile?.email || user?.email || 'Usuário'
  const metadataUrl = user?.user_metadata?.avatar_url
  const avatarUrl = typeof metadataUrl === 'string' && /^https?:\/\//i.test(metadataUrl)
    ? metadataUrl
    : null
  const iniciais = nome.split(/[\s@]+/).filter(Boolean).slice(0, 2).map((parte) => parte[0]?.toUpperCase()).join('') || 'U'

  async function enviarAvatar(evento: ChangeEvent<HTMLInputElement>) {
    const arquivo = evento.target.files?.[0]
    evento.target.value = ''
    if (!arquivo || !user) return

    const extensao = TIPOS_IMAGEM[arquivo.type]
    if (!extensao) {
      setErro('Use uma imagem JPEG, PNG, WebP ou AVIF.')
      return
    }
    if (arquivo.size > TAMANHO_MAXIMO) {
      setErro('A imagem do avatar deve ter até 2 MB.')
      return
    }

    const caminho = `avatars/${user.id}/${crypto.randomUUID()}.${extensao}`
    setEnviando(true)
    setErro(null)
    try {
      const { error: erroUpload } = await supabase.storage
        .from('user-avatars')
        .upload(caminho, arquivo, {
          contentType: arquivo.type,
          cacheControl: '3600',
          upsert: false,
        })
      if (erroUpload) throw new Error(`Não foi possível enviar o avatar: ${erroUpload.message}`)

      const { data } = supabase.storage.from('user-avatars').getPublicUrl(caminho)
      const { error: erroPerfil } = await supabase.auth.updateUser({
        data: { avatar_url: data.publicUrl },
      })
      if (erroPerfil) {
        await supabase.storage.from('user-avatars').remove([caminho])
        throw new Error(`A imagem foi enviada, mas não foi possível salvar o perfil: ${erroPerfil.message}`)
      }
      toast.success('Avatar atualizado com sucesso.')
    } catch (erroAtual) {
      const mensagem = erroAtual instanceof Error ? erroAtual.message : 'Não foi possível atualizar o avatar.'
      setErro(mensagem)
      toast.error(mensagem)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="relative flex items-center">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="sr-only"
        aria-label="Escolher imagem do avatar"
        onChange={(evento) => void enviarAvatar(evento)}
        disabled={enviando}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={enviando}
        className="group relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-champagne bg-blush text-deep-rose focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep-rose disabled:opacity-60"
        aria-label={enviando ? 'Enviando avatar' : `Alterar avatar de ${nome}`}
        title={erro ?? (enviando ? 'Enviando imagem…' : 'Alterar avatar')}
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
        ) : iniciais ? (
          <span className="text-xs font-semibold">{iniciais}</span>
        ) : (
          <UserRound size={18} aria-hidden />
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-charcoal/70 text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          <Camera size={15} aria-hidden />
        </span>
      </button>
      {erro && <span role="alert" className="sr-only">{erro}</span>}
    </div>
  )
}
