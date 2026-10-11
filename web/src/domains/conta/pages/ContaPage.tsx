import { Link, useLocation } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { SeoHead, breadcrumbJsonLd } from '@/lib/seo'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/dashboard/Card'
import { cn } from '@/lib/utils'
import { useAccount } from '../context/AccountContext'
import { ContaProtegida } from '../components/ContaProtegida'
import {
  CONTA_SECOES,
  inicialAvatar,
  nomeExibicao,
} from '../model/conta'

/**
 * Conta — o centro da cliente.
 *
 * Identidade real (Supabase Auth) +
 * as seis seções. Sem estatísticas
 * inventadas: nada de "0 pedidos"
 * pintado como dado.
 */
export function ContaPage() {
  const { profile, signOut } = useAccount()
  const location = useLocation()

  return (
    <ContaProtegida>
      <ContaPageContent
        profileNome={nomeExibicao(profile)}
        profileEmail={profile?.email ?? ''}
        inicial={inicialAvatar(profile)}
        onSair={() => void signOut()}
        currentPath={location.pathname}
      />
    </ContaProtegida>
  )
}

interface ContaPageContentProps {
  profileNome: string
  profileEmail: string
  inicial: string
  onSair: () => void
  currentPath: string
}

function ContaPageContent({
  profileNome,
  profileEmail,
  inicial,
  onSair,
  currentPath,
}: ContaPageContentProps) {
  return (
    <div>
      <SeoHead
        title="Minha conta — Angel Cosméticos"
        description="Sua conta Angel Cosméticos: perfil, pedidos, orçamentos, agendamentos, favoritos e segurança."
        canonical="/conta"
        jsonLd={breadcrumbJsonLd([
          { name: 'Início', href: '/' },
          { name: 'Minha conta', href: '/conta' },
        ])}
      />

      <header className="section-angel">
        <div className="container-angel">
          <div className="flex items-center gap-6">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-deep-rose font-display text-2xl font-bold text-white">
              {inicial}
            </div>
            <div>
              <h1 className="title-h1">
                Olá, {profileNome}
              </h1>
              <p className="text-body text-content-muted">
                {profileEmail}
              </p>
            </div>
          </div>
        </div>
      </header>

      <section className="section-angel-tight">
        <div className="container-angel">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CONTA_SECOES.map((secao) => {
              const Icon = secao.icon
              const ativa =
                currentPath === secao.href
              return (
                <Card key={secao.secao} className="h-full">
                  <Link
                    to={secao.href}
                    className={cn(
                      'flex h-full flex-col items-start',
                      ativa && 'text-deep-rose',
                    )}
                    aria-current={
                      ativa ? 'page' : undefined
                    }
                  >
                    <Icon
                      size={28}
                      className="mb-4 text-primary"
                      aria-hidden
                    />
                    <h2 className="font-display mb-1 text-lg font-bold text-soft-black">
                      {secao.rotulo}
                    </h2>
                    <p className="flex-1 text-sm text-content-muted">
                      {secao.descricao}
                    </p>
                  </Link>
                </Card>
              )
            })}
          </div>

          <div className="mt-10 flex justify-center">
            <Button variant="outline" onClick={onSair}>
              <LogOut size={18} aria-hidden />
              Sair da conta
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
