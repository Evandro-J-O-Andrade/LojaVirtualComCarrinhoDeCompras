import { useState, useEffect, useCallback } from 'react'
import { Image, Upload, Search, Trash2, Copy, Check, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface MediaItem {
  name: string
  url: string
  size: number
  createdAt: string
}

export function AdminMidiaPage() {
  const [items, setItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [search, setSearch] = useState('')
  const [copied, setCopied] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadMedia = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: listError } = await supabase.storage
        .from('product-images')
        .list('', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } })
      if (listError) throw listError

      const mediaItems: MediaItem[] = (data ?? []).map((file) => {
        const { data: urlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(file.name)
        return {
          name: file.name,
          url: urlData.publicUrl,
          size: file.metadata?.size ?? 0,
          createdAt: file.created_at ?? '',
        }
      })
      setItems(mediaItems)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar mídia')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadMedia()
  }, [loadMedia])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    setUploading(true)
    setError(null)
    try {
      for (const file of Array.from(files)) {
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(file.name, file, { upsert: true })
        if (uploadError) throw uploadError
      }
      await loadMedia()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro no upload')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleDelete = async (name: string) => {
    try {
      const { error: delError } = await supabase.storage
        .from('product-images')
        .remove([name])
      if (delError) throw delError
      await loadMedia()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir')
    }
  }

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url)
    setCopied(url)
    setTimeout(() => setCopied(null), 2000)
  }

  const filtered = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Biblioteca de Mídia</h1>
        <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
          {uploading ? 'Enviando...' : 'Enviar arquivo'}
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-red-700">{error}</div>
      )}

      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar mídia..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border py-2 pl-10 pr-4"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 size={32} className="animate-spin text-gray-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <Image size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">Nenhuma mídia encontrada.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
          {filtered.map((item) => (
            <div key={item.name} className="group relative rounded-lg border overflow-hidden">
              <img
                src={item.url}
                alt={item.name}
                className="aspect-square w-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={() => handleCopy(item.url)}
                  className="rounded-full bg-white p-2 text-gray-700 hover:bg-gray-100"
                  title="Copiar URL"
                >
                  {copied === item.url ? <Check size={16} /> : <Copy size={16} />}
                </button>
                <button
                  onClick={() => handleDelete(item.name)}
                  className="rounded-full bg-red-500 p-2 text-white hover:bg-red-600"
                  title="Excluir"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <p className="truncate px-2 py-1 text-xs text-gray-600">{item.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}