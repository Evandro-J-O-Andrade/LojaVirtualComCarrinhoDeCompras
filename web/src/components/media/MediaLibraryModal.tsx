import { useState } from 'react'
import { X, Upload, Link as LinkIcon, Image, Video } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { supabase } from '@/lib/supabase'

interface MediaItem {
  id: string
  url: string
  type: 'image' | 'video'
  origem: 'upload' | 'youtube' | 'vimeo' | 'url'
  nome: string
}

interface MediaLibraryModalProps {
  open: boolean
  onClose: () => void
  onSelect: (item: MediaItem) => void
  allowVideo?: boolean
}

export function MediaLibraryModal({ open, onClose, onSelect, allowVideo = true }: MediaLibraryModalProps) {
  const [tab, setTab] = useState<'upload' | 'url'>('upload')
  const [uploading, setUploading] = useState(false)
  const [videoUrl, setVideoUrl] = useState('')
  const [items, setItems] = useState<MediaItem[]>([])

  if (!open) return null

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`
      const bucket = file.type.startsWith('video/') ? 'site-media' : 'product-images'
      const { error } = await supabase.storage.from(bucket).upload(fileName, file)
      if (error) throw error
      const { data } = supabase.storage.from(bucket).getPublicUrl(fileName)
      const item: MediaItem = {
        id: fileName,
        url: data.publicUrl,
        type: file.type.startsWith('video/') ? 'video' : 'image',
        origem: 'upload',
        nome: file.name,
      }
      setItems((prev) => [item, ...prev])
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao enviar arquivo')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const adicionarVideoUrl = () => {
    if (!videoUrl) return
    let origem: MediaItem['origem'] = 'url'
    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) origem = 'youtube'
    if (videoUrl.includes('vimeo.com')) origem = 'vimeo'
    const item: MediaItem = {
      id: `url-${Date.now()}`,
      url: videoUrl,
      type: 'video',
      origem,
      nome: videoUrl,
    }
    setItems((prev) => [item, ...prev])
    setVideoUrl('')
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">Biblioteca de Mídia</h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <div className="flex border-b">
          <button onClick={() => setTab('upload')} className={`px-4 py-2 ${tab === 'upload' ? 'border-b-2 border-blue-600' : ''}`}>Enviar arquivo</button>
          {allowVideo && <button onClick={() => setTab('url')} className={`px-4 py-2 ${tab === 'url' ? 'border-b-2 border-blue-600' : ''}`}>Adicionar vídeo por URL</button>}
        </div>
        <div className="p-4 flex-1 overflow-auto">
          {tab === 'upload' && (
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Upload className="mx-auto mb-4 text-gray-400" size={40} />
              <p className="mb-4 text-sm text-gray-600">Arraste ou selecione imagens e vídeos</p>
              <input type="file" accept="image/*,video/*,application/pdf,application/xml,text/xml,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={handleUpload} disabled={uploading} className="hidden" id="media-upload" />
              <label htmlFor="media-upload">
                <Button variant="outline" disabled={uploading} onClick={() => document.getElementById('media-upload')?.click()} type="button">{uploading ? 'Enviando...' : 'Selecionar arquivo'}</Button>
              </label>
            </div>
          )}
          {tab === 'url' && allowVideo && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input label="URL do vídeo (YouTube, Vimeo ou direto)" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://..." />
                <Button className="mt-6" onClick={adicionarVideoUrl}><LinkIcon size={16} /> Adicionar</Button>
              </div>
            </div>
          )}
          <div className="mt-6 grid grid-cols-3 gap-4">
            {items.map((item) => (
              <div key={item.id} onClick={() => { onSelect(item); onClose() }} className="border rounded overflow-hidden cursor-pointer hover:border-blue-500">
                {item.type === 'image' ? (
                  <img src={item.url} alt={item.nome} className="w-full h-32 object-cover" />
                ) : (
                  <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
                    <Video size={32} className="text-gray-400" />
                  </div>
                )}
                <div className="p-2 text-xs truncate flex items-center gap-1">
                  {item.type === 'image' ? <Image size={12} /> : <Video size={12} />}
                  {item.nome}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
