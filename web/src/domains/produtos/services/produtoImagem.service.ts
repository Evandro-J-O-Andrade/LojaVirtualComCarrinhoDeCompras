import { supabase } from '@/lib/supabase'

export interface ImagemInput {
  url: string
  ordem: number
  principal: boolean
}

export interface UploadResultado {
  url: string
  storagePath: string
}

export class ProdutoImagemService {
  private readonly BUCKET = 'product-images'
  private readonly STORAGE_BASE =
    'supabase.co/storage/v1/object/public/product-images'

  async uploadImagem(
    produtoId: number,
    arquivo: File,
  ): Promise<UploadResultado> {
    const ext = arquivo.name.split('.').pop()?.toLowerCase() ?? 'webp'
    const uuid = crypto.randomUUID()
    const caminho = `produto-${produtoId}/${uuid}.${ext}`

    const { data, error } = await supabase.storage
      .from(this.BUCKET)
      .upload(caminho, arquivo, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      throw new Error(`Falha no upload: ${error.message}`)
    }

    if (!data || !data.path) {
      throw new Error(
        'Upload concluído, mas sem resposta do Storage.',
      )
    }

    const urlPublica = supabase.storage
      .from(this.BUCKET)
      .getPublicUrl(data.path).data.publicUrl

    return {
      url: urlPublica,
      storagePath: data.path,
    }
  }

  async criarRegistro(
    produtoId: number,
    dados: ImagemInput,
  ): Promise<void> {
    const { error } = await supabase
      .from('produto_imagem')
      .insert({
        produto_id: produtoId,
        url: dados.url,
        ordem: dados.ordem,
        principal: dados.principal,
      })

    if (error) {
      throw new Error(
        `Falha ao registrar imagem: ${error.message}`,
      )
    }
  }

  async reordenarImagens(
    produtoId: number,
    atualizacoes: {
      id: number
      ordem: number
      principal: boolean
    }[],
  ): Promise<void> {
    const updates = atualizacoes.map((item) =>
      supabase
        .from('produto_imagem')
        .update({
          ordem: item.ordem,
          principal: item.principal,
        })
        .eq('id', item.id)
        .eq('produto_id', produtoId),
    )

    const resultados = await Promise.all(updates)
    for (const { error } of resultados) {
      if (error) {
        throw new Error(
          `Falha ao reordenar imagem: ${error.message}`,
        )
      }
    }
  }

  async definirPrincipalUnica(
    produtoId: number,
    imagemId: number,
  ): Promise<void> {
    const { error } = await supabase.rpc(
      'produto_imagem_definir_principal',
      {
        p_produto_id: produtoId,
        p_imagem_id: imagemId,
      },
    )

    if (error) {
      if (
        error.message?.includes('does not exist') ||
        error.message?.includes('function')
      ) {
        throw new Error(
          'RPC produto_imagem_definir_principal não está disponível. ' +
            'A migration 20261011000004_produto_imagem_unique_principal_revised.sql ' +
            'precisa ser aplicada no Supabase antes de alternar imagens principais.',
        )
      }
      throw new Error(
        `Falha ao definir imagem principal: ${error.message}`,
      )
    }
  }

  async removerImagem(
    produtoId: number,
    imagemId: number,
    url: string,
  ): Promise<{ storageRemovido: boolean; storageErro?: string }> {
    const { error: deleteDbError } = await supabase
      .from('produto_imagem')
      .delete()
      .eq('id', imagemId)
      .eq('produto_id', produtoId)

    if (deleteDbError) {
      throw new Error(
        `Falha ao remover registro: ${deleteDbError.message}`,
      )
    }

    if (!url.includes(this.STORAGE_BASE)) {
      return { storageRemovido: false }
    }

    const caminhoMatch = url.match(/product-images\/(.+)$/)
    if (!caminhoMatch) {
      return { storageRemovido: false }
    }

    const { error: deleteStorageError } = await supabase.storage
      .from(this.BUCKET)
      .remove([caminhoMatch[1]])

    if (deleteStorageError) {
      return {
        storageRemovido: false,
        storageErro: deleteStorageError.message,
      }
    }

    return { storageRemovido: true }
  }

  async uploadMultiplo(
    produtoId: number,
    arquivos: File[],
  ): Promise<UploadResultado[]> {
    const resultados: UploadResultado[] = []
    const maxOrdem = await this.obterProximaOrdem(produtoId)
    let ordemAtual = maxOrdem

    for (const arquivo of arquivos) {
      let uploadResultado: UploadResultado | null = null
      try {
        uploadResultado = await this.uploadImagem(
          produtoId,
          arquivo,
        )

        const { error: insertError } = await supabase
          .from('produto_imagem')
          .insert({
            produto_id: produtoId,
            url: uploadResultado.url,
            ordem: ordemAtual,
            principal: false,
          })

        if (insertError) {
          throw new Error(
            `Falha ao registrar imagem: ${insertError.message}`,
          )
        }

        resultados.push(uploadResultado)
        ordemAtual++
      } catch (err) {
        if (uploadResultado) {
          await this.limparArquivoOrfao(uploadResultado.storagePath)
        }
        for (const item of resultados) {
          await this.limparRegistroEArquivo(item.url, item.storagePath)
        }
        resultados.length = 0
        throw err
      }
    }

    return resultados
  }

  private async obterProximaOrdem(
    produtoId: number,
  ): Promise<number> {
    const { data, error } = await supabase
      .from('produto_imagem')
      .select('ordem')
      .eq('produto_id', produtoId)
      .order('ordem', { ascending: false })
      .limit(1)
      .single()

    if (error) return 0
    return (data?.ordem ?? -1) + 1
  }

  private async limparRegistroEArquivo(
    url: string,
    storagePath: string,
  ): Promise<void> {
    await supabase
      .from('produto_imagem')
      .delete()
      .eq('url', url)

    if (storagePath && !url.includes(this.STORAGE_BASE)) {
      return
    }

    const caminhoMatch = url.match(/product-images\/(.+)$/)
    if (caminhoMatch) {
      await supabase.storage
        .from(this.BUCKET)
        .remove([caminhoMatch[1]])
    }
  }

  private async limparArquivoOrfao(
    storagePath: string,
  ): Promise<void> {
    const { error } = await supabase.storage
      .from(this.BUCKET)
      .remove([storagePath])

    if (error) {
      console.warn(
        `Não foi possível remover arquivo órfão do Storage: ${error.message}`,
      )
    }
  }
}

export const produtoImagemService =
  new ProdutoImagemService()
