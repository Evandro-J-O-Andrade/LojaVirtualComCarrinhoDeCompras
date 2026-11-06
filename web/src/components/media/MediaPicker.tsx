import { useState, useEffect, useCallback } from 'react'
import { X, Upload, Link as LinkIcon, Image, Video, Search, Loader2 } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { supabase } from '@/lib/supabase'

export interface MediaItem {
  id: string
  name: string
  url: string
  type: 'image' | 'video'
  size: number
  createdAt: string
  bucket: string
}

interface MediaPickerProps {
  open: boolean
  onClose: () => void
  onSelect: (item: MediaItem) => void
  allowVideo?: boolean
  allowUrl?: boolean
  bucket?: string
}

export function MediaPicker({ open, onClose, onSelect, allowUrl = true, bucket = 'product-images' }: MediaPickerProps) {
  const [tab, setTab] = useState<'library' | 'upload' | 'url'>('library')
  const [items, setItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [search, setSearch] = useState('')
  const [urlInput, setUrlInput] = useState('')
  const [error, setError] = useState<string | null>(null)

  const loadLibrary = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: listError } = await supabase.storage
        .from(bucket)
        .list('', { limit: 200, sortBy: { column: 'created_at', order: 'desc' } })
      if (listError) throw listError
      const mediaItems: MediaItem[] = (data ?? []).map((file) => {
        const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(file.name)
        const isVideo = file.name.match(/\.(mp4|webm|mov|avi)$/i) !== null
        return {
          id: file.name,
          name: file.name,
          url: urlData.publicUrl,
          type: isVideo ? 'video' : 'image',
          size: file.metadata?.size ?? 0,
          createdAt: file.created_at ?? '',
          bucket,
        }
      })
      setItems(mediaItems)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar biblioteca')
    } finally {
      setLoading(false)
    }
  }, [bucket])

  useEffect(() => {
    if (open) {
      loadLibrary()
    }
  }, [open, loadLibrary])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    setUploading(true)
    setError(null)
    try {
      for (const file of Array.from(files)) {
        const ext = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`
        const { error: uploadError } = await supabase.storage.from(bucket).upload(fileName, file)
        if (uploadError) throw uploadError
        const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName)
        const isVideo = file.type.startsWith('video/')
        const item: MediaItem = {
          id: fileName,
          name: file.name,
          url: urlData.publicUrl,
          type: isVideo ? 'video' : 'image',
          size: file.size,
          createdAt: new Date().toISOString(),
          bucket,
        }
        setItems((prev) => [item, ...prev])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro no upload')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleImportUrl = () => {
    if (!urlInput.trim()) return
    const isVideo = urlInput.match(/\.(mp4|webm|mov|avi)$/i) !== null
    const item: MediaItem = {
      id: `url-${Date.now()}`,
      name: urlInput.split('/').pop() || 'url-import',
      url: urlInput.trim(),
      type: isVideo ? 'video' : 'image',
      size: 0,
      createdAt: new Date().toISOString(),
      bucket: 'external',
    }
    setItems((prev) => [item, ...prev])
    setUrlInput('')
  }

  const filtered = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()),
  )

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 flex w-full max-w-3xl flex-col rounded-2xl bg-white shadow-xl" style={{ maxHeight: '85vh' }}>
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-bold text-soft-black">Biblioteca de Mídia</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="flex border-b">
          <button onClick={() => setTab('library')} className={`px-4 py-2 text-sm font-medium ${tab === 'library' ? 'border-b-2 border-deep-rose text-deep-rose' : 'text-gray-500'}`}>
            Biblioteca
          </button>
          <button onClick={() => setTab('upload')} className={`px-4 py-2 text-sm font-medium ${tab === 'upload' ? 'border-b-2 border-deep-rose text-deep-rose' : 'text-gray-500'}`}>
            Do computador
          </button>
          {allowUrl && (
            <button onClick={() => setTab('url')} className={`px-4 py-2 text-sm font-medium ${tab === 'url' ? 'border-b-2 border-deep-rose text-deep-rose' : 'text-gray-500'}`}>
              Por URL
            </button>
          )}
        </div>

        <div className="flex-1 overflow-auto p-4">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
          )}

          {tab === 'library' && (
            <>
              <div className="relative mb-4">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar mídia..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-lg border py-2 pl-10 pr-4 text-sm"
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
                <div className="grid grid-cols-3 gap-4 md:grid-cols-4 lg:grid-cols-5">
                  {filtered.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => { onSelect(item); onClose() }}
                      className="group relative overflow-hidden rounded-lg border hover:border-deep-rose"
                    >
                      {item.type === 'image' ? (
                        <img src={item.url} alt={item.name} className="aspect-square w-full object-cover" />
                      ) : (
                        <div className="flex aspect-square w-full items-center justify-center bg-gray-100">
                          <Video size={32} className="text-gray-400" />
                        </div>
                      )}
                      <p className="truncate px-2 py-1 text-xs text-gray-600">{item.name}</p>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {tab === 'upload' && (
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Upload className="mx-auto mb-4 text-gray-400" size={40} />
              <p className="mb-4 text-sm text-gray-600">Selecione arquivos do computador</p>
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleUpload}
                disabled={uploading}
                className="hidden"
                id="media-picker-upload"
              />
              <label htmlFor="media-picker-upload">
                <Button variant="primary" disabled={uploading} onClick={() => document.getElementById('media-picker-upload')?.click()} type="button">
                  {uploading ? 'Enviando...' : 'Selecionar arquivo'}
                </Button>
              </label>
            </div>
          )}

          {tab === 'url' && allowUrl && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  label="URL da imagem ou vídeo"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://..."
                />
                <Button className="mt-6" onClick={handleImportUrl}>
                  <LinkIcon size={16} /> Importar
                </Button>
              </div>
              <p className="text-xs text-gray-500">A URL será armazenada como referência. O arquivo não será copiado para o Storage.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}