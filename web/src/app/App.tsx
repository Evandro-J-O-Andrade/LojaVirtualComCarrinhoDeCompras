import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CarrinhoProvider } from '@/domains/carrinho/context/CarrinhoProvider'
import { FavoritesProvider } from '@/contexts/FavoritesContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { AccountProvider } from '@/domains/conta/context/AccountContext'
import { Toaster } from 'sonner'
import { AngelRouter } from '@/routes/AppRouter'
import { CinematicIntro } from '@/components/brand/CinematicIntro'
import { useDocumentIntro } from '@/hooks/useDocumentIntro'

const queryClient = new QueryClient()

export function App() {
  // Gate de entrada. Fica ACIMA do router: navegar não reinicia o Cinema,
  // mas F5 abre de novo porque o estado nasce a cada documento.
  const intro = useDocumentIntro()

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AccountProvider>
          <FavoritesProvider>
            <CarrinhoProvider>
            {intro.active ? (
              <CinematicIntro onFinish={intro.finish} />
            ) : (
              <>
                <Toaster position="bottom-right" richColors />
                <AngelRouter />
              </>
            )}
          </CarrinhoProvider>
          </FavoritesProvider>
        </AccountProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
