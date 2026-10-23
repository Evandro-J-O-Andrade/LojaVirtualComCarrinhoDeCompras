import {
  createClient,
  type SupabaseClient,
} from '@supabase/supabase-js'

const url = (import.meta.env.VITE_SUPABASE_URL ?? '').trim()
const chave = (
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  ''
).trim()

/**
 * O cliente do Supabase é criado no módulo.
 * Quando as variáveis públicas não existem,
 * o `createClient` lançaria "supabaseKey is
 * required" no import e derrubaria a aplicação
 * inteira (tela branca) — inclusive as páginas
 * que não dependem do banco.
 *
 * Aqui o cliente só é criado quando há
 * configuração. Sem ela, o app continua
 * subindo e o erro aparece no ponto de uso,
 * com uma mensagem que diz o que falta.
 */
export const MENSAGEM_SEM_CONFIGURACAO =
  'O serviço da Angel não está configurado neste ambiente. ' +
  'Defina VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY e reinicie o servidor.'

export class ErroSupabaseNaoConfigurado extends Error {
  constructor() {
    super(MENSAGEM_SEM_CONFIGURACAO)
    this.name = 'ErroSupabaseNaoConfigurado'
  }
}

export const supabaseConfigurado = Boolean(url && chave)

/**
 * Alvo vazio que lança ao ser usado. Existe
 * para que nenhuma chamada "funcione" sem
 * configuração: o erro é explícito e não um
 * retorno silencioso com dados falsos.
 */
function alvoSemConfiguracao(): unknown {
  const alvo = function alvoSemConfiguracao() {}
  return new Proxy(alvo, {
    get(_alvo, propriedade) {
      // `then` costuma ser lido por promessas e
      // `await`; devolver undefined evita que o
      // objeto seja tratado como "thenable".
      if (propriedade === 'then') return undefined
      return alvoSemConfiguracao()
    },
    apply() {
      throw new ErroSupabaseNaoConfigurado()
    },
  })
}

export const supabase: SupabaseClient = supabaseConfigurado
  ? createClient(url, chave)
  : (alvoSemConfiguracao() as unknown as SupabaseClient)
