# PLANO DE COMMITS — ANGEL COSMÉTICOS (checkpoint/angel-shell-cinema-green)

**Data:** 2026-10-23
**Branch:** `checkpoint/angel-shell-cinema-green` @ `58c548f`
**Status:** Pronto para commit. Nenhum commit ou push realizado.

---

## 1. Backup (concluído)

- **Local:** `D:\Backups\LojaVirtualComCarrinhoDeCompras\pre-migration-2026-10-23_04-40-45`
- **Manifest:** 622 entradas (54 não rastreados, 517 deletados, 51 modificados)
- **Hashes:** 75 arquivos (SHA-256)
- **Git HEAD:** `58c548f71451dce4fafe7037f64b5bd51e824f26`

## 2. Classificação dos arquivos

### Grupo A — Código da aplicação (web/src/)
**Arquivos modificados (30):**
- `web/src/components/auth/ProtectedRoute.tsx`
- `web/src/components/layout/Footer.tsx`
- `web/src/components/navigation/Header.tsx`
- `web/src/components/navigation/MobileNav.tsx`
- `web/src/contexts/AuthContext.tsx`
- `web/src/contexts/FavoritesContext.tsx`
- `web/src/design/cinema.ts`
- `web/src/domains/atendimento/pages/ContatoPage.tsx`
- `web/src/domains/conta/context/AccountContext.tsx` + test
- `web/src/domains/conta/model/conta.ts` + test
- `web/src/domains/conta/pages/EntrarPage.tsx` + contract test
- `web/src/domains/conteudo/model/asset.ts` + test
- `web/src/domains/conteudo/model/experiencia.ts` + test
- `web/src/domains/home/components/HeroCinematico.tsx`
- `web/src/domains/home/pages/HomePage.tsx`
- `web/src/domains/institucional/model/editorial.ts`
- `web/src/domains/institucional/model/marca.ts`
- `web/src/domains/institucional/pages/SobrePage.tsx`
- `web/src/domains/mimos/adapters/editorial-catalog.ts`
- `web/src/domains/produtos/adapters/editorial-catalog.ts`
- `web/src/domains/produtos/model/categoria-editorial.ts`
- `web/src/domains/produtos/pages/ProductDetailPage.contract.test.tsx`
- `web/src/domains/services/adapters/editorial-catalog.ts`
- `web/src/lib/supabase.ts`
- `web/src/pages/Admin/Login/index.tsx`
- `web/src/routes/AppRouter.tsx`

**Arquivos não rastreados (novos):**
- `web/src/app/App.smoke.test.tsx`
- `web/src/components/auth/ProtectedRoute.test.tsx`
- `web/src/components/common/ScrollToTop.tsx`
- `web/src/contexts/AuthContext.test.tsx`
- `web/src/contexts/FavoritesContext.test.tsx`
- `web/src/domains/admin/services/` (novo diretório)
- `web/src/domains/conta/pages/ContaPages.contract.test.tsx`
- `web/src/domains/home/components/borboletas-hero.css`
- `web/src/domains/home/components/BorboletasHero.tsx`
- `web/src/domains/home/components/HeroCinematico.integration.patch`
- `web/src/domains/home/components/README.md`
- `web/src/lib/supabase.test.ts`

### Grupo B — Migrations e seeds SQL (supabase/)
**Arquivos modificados:**
- `supabase/inspect-ddl.cjs` (sanitizado — usa process.env.DIRECT_URL)

**Arquivos não rastreados:**
- `supabase/migrations/` (15 arquivos — já existentes no repo, não novos)

**Nota:** As migrations já estão no repositório. As alterações em `inspect-ddl.cjs` são sanitização de credenciais.

### Grupo C — Catálogo e mídias (assets/, web/public/)
**Arquivos modificados (9 HTML + 6 JS):**
- `assets/html/*.html` (8 arquivos)
- `assets/js/*.js` (6 arquivos)
- `index.html`

**Arquivos deletados (517):** Reorganização de imagens/vídeos de `assets/img/` e `web/public/assets/img/` para novos diretórios categorizados.

**Arquivos não rastreados (novos diretórios):**
- `assets/img/banners/`, `assets/img/beleza/`, `assets/img/casa/`, `assets/img/categorias/`, `assets/img/eventos/`, `assets/img/institucional/`, `assets/img/interface/`, `assets/img/marca/`, `assets/img/marcas/`, `assets/img/moda/`, `assets/img/produtos/`, `assets/img/social/`
- `assets/video/sessao-maquiagem/`, `assets/video/skincare/`
- `web/public/assets/img/` (mesmos diretórios)
- `web/public/assets/video/` (mesmos diretórios)

### Grupo D — Documentação e configuração
**Arquivos modificados:**
- `.gitignore` (adicionado `supabase/.temp/`)
- `NOTIFICACOES_COMUNICACAO_ANGEL_V1.0.md`

**Arquivos não rastreados (docs/):**
- `DECISOES_ARQUITETURA_v1.0.md`
- `docs/audit/`
- `docs/DIAGNOSTICO_MIMOS_SERVICOS.md`
- `docs/LOTE_A_CATALOGO.md`
- `docs/manifesto-imagens-runtime.csv`
- `docs/MATRIZ_CORRECOES_ETAPA2.md`
- `docs/PLANO_IMPLANTACAO_MIMOS_SERVICOS.md`
- `docs/PLANO_MESTRE_ANGEL_COSMETICOS_AS_IS_TO_BE.md`
- `docs/RBAC_SCRIPT_VALIDACAO.md`
- `docs/RBAC_VALIDACAO.md`

**Arquivos não rastreados (tools/):**
- `tools/backup-recovery.ps1`
- `tools/corrigir-legado-seo-assets.ps1`
- `tools/organizar-imagens-runtime.ps1`
- `tools/verificar-referencias-midias.ps1`

**Arquivo modificado (root):**
- `test-direct.cjs` (sanitizado — usa process.env.DIRECT_URL)

## 3. Auditoria de segurança

| Verificação | Resultado |
|-------------|-----------|
| Credencial hardcoded `An2907081831` | 0 matches (git grep) |
| `postgresql://` em código | 0 matches |
| `service_role` em código (.ts/.tsx/.js) | 0 matches (apenas docs) |
| Arquivos `.dump` no working tree | Nenhum (backup externo) |
| Arquivos `.crt` no working tree | Nenhum |
| `.env` no working tree | Existe (raiz e web/) — verificado que não contém secrets hardcoded |
| `supabase/.temp/pooler-url` | Removido do índice (staged deletion) |
| `.gitignore` atualizado | `supabase/.temp/` adicionado |

## 4. Validação (concluída)

| Comando | Resultado |
|---------|-----------|
| `npm run build` | ✓ sucesso (tsc -b && vite build) |
| `npm run lint` | ✓ warnings apenas (preexistentes) |
| `npm run test:run` | ✓ 47/47 arquivos, 362/362 testes |

## 5. Commits propostos (ordem sugerida)

### Commit 1: `chore: sanitizar credenciais e atualizar .gitignore`
- `.gitignore` (add `supabase/.temp/`)
- `supabase/inspect-ddl.cjs` (usa process.env.DIRECT_URL)
- `test-direct.cjs` (usa process.env.DIRECT_URL)
- `supabase/.temp/pooler-url` (remover do índice)

### Commit 2: `feat: reorganizar assets e mídias por categoria`
- 517 deleções (imagens/vídeos movidos)
- Novos diretórios em `assets/img/` e `web/public/assets/img/`
- `assets/html/*.html` (atualizados)
- `assets/js/*.js` (atualizados)
- `index.html` (atualizado)

### Commit 3: `feat: atualizar componentes, rotas e contextos`
- `web/src/components/` (Header, Footer, MobileNav, ProtectedRoute, ScrollToTop)
- `web/src/contexts/` (AuthContext, FavoritesContext)
- `web/src/design/cinema.ts`
- `web/src/routes/AppRouter.tsx`
- `web/src/lib/supabase.ts`
- `web/src/pages/Admin/Login/index.tsx`

### Commit 4: `feat: atualizar domínios e adapters`
- `web/src/domains/` (atendimento, conta, conteudo, home, institucional, mimos, produtos, services)
- Inclui SobrePage com contato, valores e mapa
- Inclui HeroCinematico com BorboletasHero
- Inclui AdminPermissionContext (pendente)

### Commit 5: `docs: adicionar documentação de auditoria e planejamento`
- `docs/` (todos os arquivos novos)
- `DECISOES_ARQUITETURA_v1.0.md`
- `NOTIFICACOES_COMUNICACAO_ANGEL_V1.0.md`
- `tools/` (scripts de organização e verificação)

### Commit 6: `test: adicionar testes e smoke tests`
- `web/src/app/App.smoke.test.tsx`
- `web/src/components/auth/ProtectedRoute.test.tsx`
- `web/src/contexts/AuthContext.test.tsx`
- `web/src/contexts/FavoritesContext.test.tsx`
- `web/src/domains/conta/pages/ContaPages.contract.test.tsx`
- `web/src/domains/produtos/pages/ProductDetailPage.contract.test.tsx`
- `web/src/lib/supabase.test.ts`
- `web/src/domains/home/components/borboletas-hero.css`
- `web/src/domains/home/components/BorboletasHero.tsx`
- `web/src/domains/home/components/HeroCinematico.integration.patch`
- `web/src/domains/home/components/README.md`

## 6. O que NÃO incluir nos commits

- Arquivos `.dump` (backup externo)
- Arquivos `.crt`, `.key`, `.pem` (nenhum encontrado)
- Arquivos `.env` (já no .gitignore)
- `supabase/.temp/` (já no .gitignore)
- `node_modules/` (já no .gitignore)

## 7. Comandos sugeridos (para execução autorizada)

```powershell
# Commit 1: Sanitização
git add .gitignore supabase/inspect-ddl.cjs test-direct.cjs
git rm --cached supabase/.temp/pooler-url
git commit -m "chore: sanitizar credenciais e atualizar .gitignore"

# Commit 2: Assets
git add assets/ web/public/assets/ index.html
git commit -m "feat: reorganizar assets e midias por categoria"

# Commit 3: Componentes
git add web/src/components/ web/src/contexts/ web/src/design/ web/src/routes/ web/src/lib/supabase.ts web/src/pages/
git commit -m "feat: atualizar componentes, rotas e contextos"

# Commit 4: Domínios
git add web/src/domains/
git commit -m "feat: atualizar dominios e adapters"

# Commit 5: Documentação
git add docs/ DECISOES_ARQUITETURA_v1.0.md NOTIFICACOES_COMUNICACAO_ANGEL_V1.0.md tools/
git commit -m "docs: adicionar documentacao de auditoria e planejamento"

# Commit 6: Testes
git add web/src/app/ web/src/lib/supabase.test.ts web/src/domains/home/components/
git commit -m "test: adicionar testes e smoke tests"

# Push (após revisão)
git push origin checkpoint/angel-shell-cinema-green
```

## 8. Critérios de liberação para push

- [ ] Todos os commits revisados individualmente
- [ ] `git diff --cached` verificado antes de cada commit
- [ ] Nenhum arquivo sensível incluído
- [ ] Build e testes passando (já confirmado)
- [ ] Autorização explícita para push

---

**Nenhum commit ou push foi realizado. Aguardando autorização para executar.**