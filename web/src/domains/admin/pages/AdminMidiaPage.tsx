import { Image, Upload, Search } from 'lucide-react'

export function AdminMidiaPage() {

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Biblioteca de Mídia</h1>
        <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          <Upload size={18} />
          Enviar arquivo
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar mídia..."
            className="w-full rounded-lg border py-2 pl-10 pr-4"
          />
        </div>
        <select className="rounded-lg border px-3 py-2">
          <option value="">Todos os tipos</option>
          <option value="imagem">Imagens</option>
          <option value="video">Vídeos</option>
          <option value="banner">Banners</option>
        </select>
      </div>

      <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
        <Image size={48} className="mx-auto mb-4 text-gray-400" />
        <p className="text-gray-500">Nenhuma mídia cadastrada ainda.</p>
        <p className="text-sm text-gray-400">
          Envie imagens ou vídeos para começar a construir sua biblioteca.
        </p>
      </div>
    </div>
  )
}