import { Globe, Phone, MapPin, Share2, Search, Save } from 'lucide-react'

export function AdminConfiguracoesPage() {

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Configurações</h1>
        <button
          onClick={() => {}}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          <Save size={18} />
          Salvar
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-lg border p-4">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Globe size={20} /> Identidade
          </h2>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Nome da loja</label>
              <input type="text" className="w-full rounded border px-3 py-2" defaultValue="Angel Cosméticos" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Slogan</label>
              <input type="text" className="w-full rounded border px-3 py-2" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Logo URL</label>
              <input type="text" className="w-full rounded border px-3 py-2" />
            </div>
          </div>
        </section>

        <section className="rounded-lg border p-4">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Phone size={20} /> Contato
          </h2>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium">WhatsApp</label>
              <input type="text" className="w-full rounded border px-3 py-2" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Telefone</label>
              <input type="text" className="w-full rounded border px-3 py-2" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">E-mail</label>
              <input type="email" className="w-full rounded border px-3 py-2" />
            </div>
          </div>
        </section>

        <section className="rounded-lg border p-4">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <MapPin size={20} /> Endereço
          </h2>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Endereço completo</label>
              <textarea className="w-full rounded border px-3 py-2" rows={3} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Cidade / Estado</label>
              <input type="text" className="w-full rounded border px-3 py-2" />
            </div>
          </div>
        </section>

        <section className="rounded-lg border p-4">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Share2 size={20} /> Redes Sociais
          </h2>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Instagram</label>
              <input type="text" className="w-full rounded border px-3 py-2" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Facebook</label>
              <input type="text" className="w-full rounded border px-3 py-2" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">TikTok</label>
              <input type="text" className="w-full rounded border px-3 py-2" />
            </div>
          </div>
        </section>

        <section className="rounded-lg border p-4 md:col-span-2">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Search size={20} /> SEO Global
          </h2>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Meta título</label>
              <input type="text" className="w-full rounded border px-3 py-2" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Meta descrição</label>
              <textarea className="w-full rounded border px-3 py-2" rows={2} />
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}