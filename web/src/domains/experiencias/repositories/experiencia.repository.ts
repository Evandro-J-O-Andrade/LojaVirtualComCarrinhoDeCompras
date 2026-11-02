import { supabase } from '@/lib/supabase'
import type { Experiencia, ExperienciaInput, ExperienciaMidia, ExperienciaStatus } from '../model/experiencia'

export interface ExperienciaRepository {
  listar(): Promise<Experiencia[]>
  buscarPorId(id: number): Promise<Experiencia | null>
  buscarPorSlug(slug: string): Promise<Experiencia | null>
  criar(input: ExperienciaInput): Promise<Experiencia>
  atualizar(id: number, input: Partial<ExperienciaInput>): Promise<Experiencia>
  excluir(id: number): Promise<void>
  publicar(id: number): Promise<Experiencia>
  arquivar(id: number): Promise<Experiencia>
  adicionarMidia(experienciaId: number, url: string, tipo?: string, legenda?: string, principal?: boolean): Promise<ExperienciaMidia>
  removerMidia(id: number): Promise<void>
}
