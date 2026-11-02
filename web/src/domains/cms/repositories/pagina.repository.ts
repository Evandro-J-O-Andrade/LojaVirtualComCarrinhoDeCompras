import { supabase } from '@/lib/supabase'
import type { Pagina, PaginaInput, PaginaMidia, PaginaSecao } from '../model/pagina'

export interface PaginaRepository {
  listar(): Promise<Pagina[]>
  buscarPorId(id: number): Promise<Pagina | null>
  buscarPorSlug(slug: string): Promise<Pagina | null>
  criar(input: PaginaInput): Promise<Pagina>
  atualizar(id: number, input: Partial<PaginaInput>): Promise<Pagina>
  excluir(id: number): Promise<void>
  publicar(id: number): Promise<Pagina>
  arquivar(id: number): Promise<Pagina>
  adicionarMidia(paginaId: number, url: string, tipo?: string, legenda?: string, principal?: boolean): Promise<PaginaMidia>
  removerMidia(id: number): Promise<void>
  adicionarSecao(paginaId: number, tipo: string, titulo?: string, conteudo?: string): Promise<PaginaSecao>
  removerSecao(id: number): Promise<void>
}
