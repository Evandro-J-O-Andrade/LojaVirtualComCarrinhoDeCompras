# PLANO DE INTEGRAÇÃO — checkpoint/angel-shell-cinema-green → main

**Data:** 2026-10-23
**Status:** Preparado. Nenhuma alteração em main realizada.

---

## 1. Estado atual

| Item | Valor |
|------|-------|
| Branch atual | `checkpoint/angel-shell-cinema-green` |
| Main (local) | `612aea4` (ajuste de html) |
| Main (remote) | `612aea4` (mesmo commit) |
| Commits ahead | 15 |
| Commits behind | 0 |
| Diff | 1383 arquivos, +73813/-4 linhas |

## 2. Preservação da versão antiga (rollback)

### Criar tag de backup
```bash
git tag backup/main-pre-integration-2026-10-23 main
git push origin backup/main-pre-integration-2026-10-23
```

### Manter branch de reconstrução
- NÃO deletar `checkpoint/angel-shell-cinema-green` após o merge
- Manter a tag `backup/main-pre-integration-2026-10-23` permanentemente

### Rollback procedure
```bash
# Se a integração falhar:
git checkout main
git reset --hard backup/main-pre-integration-2026-10-23
git push --force-with-lease origin main
```

## 3. Integração (via Pull Request)

### Opção A: Pull Request (recomendado)
```bash
# No GitHub:
# 1. Criar PR de checkpoint/angel-shell-cinema-green → main
# 2. Revisar diff completo
# 3. Merge via "Squash and merge" ou "Create a merge commit"
# 4. NÃO deletar a branch de origem
```

### Opção B: Merge local (se PR não disponível)
```bash
git checkout main
git merge --no-ff checkpoint/angel-shell-cinema-green -m "merge: integrar checkpoint/angel-shell-cinema-green"
# Revisar antes de push
git push origin main
```

## 4. Validação pós-integração

### Build e testes
```bash
cd web
npm install
npm run build          # tsc -b && vite build
npm run lint           # oxlint
npm run test:run       # vitest run
```

### Verificações manuais
- [ ] Página inicial carrega (Hero, navbar, footer)
- [ ] Footer com fundo preto (#0B0B0D)
- [ ] Borboletas no hero (decorativas, não bloqueiam cliques)
- [ ] Página Sobre com missão, visão, valores, contato e mapa
- [ ] Catálogo de produtos carrega
- [ ] Mimos exibe erro (tabelas ausentes — esperado)
- [ ] Serviços exibe erro (tabela ausente — esperado)
- [ ] Agendamento exibe erro (tabelas ausentes — esperado)
- [ ] Imagens carregam (verificar paths)
- [ ] Responsividade (desktop + mobile)

### Verificações de segurança
- [ ] Nenhum segredo no código (git grep)
- [ ] .gitignore inclui supabase/.temp/
- [ ] Nenhum .dump ou .crt no repositório

## 5. Migrações Supabase (NÃO aplicar automaticamente)

Após o merge, as migrations estarão no repositório mas NÃO devem ser aplicadas automaticamente. Sequência:

1. Revisar migrations 003-006 individualmente
2. Comparar com schema remoto (já feito — 17 tabelas ausentes)
3. Aplicar em ordem: 003 → 004 → 005 → 006
4. Deploy Edge Functions: booking-availability, booking-create
5. Seed mínimo: 1 serviço, 1 profissional, 1 mimo

**Cada passo requer autorização explícita.**

## 6. Publicação (condicionada)

### Checklist final
- [ ] PR revisado e aprovado
- [ ] Build passando na CI
- [ ] Testes passando na CI
- [ ] Lint sem erros novos
- [ ] Versão antiga preservada (tag + branch)
- [ ] Migrações NÃO aplicadas automaticamente
- [ ] Rollback testado (tag acessível)

### Publicação
```bash
# Após merge em main:
# 1. Verificar que o deploy foi para o ambiente correto
# 2. Acessar o site publicado e confirmar versão
# 3. Se falhar: git checkout backup/main-pre-integration-2026-10-23 && git push --force-with-lease
```

## 7. O que NÃO fazer

- ❌ Não deletar a branch `checkpoint/angel-shell-cinema-green`
- ❌ Não aplicar migrações automaticamente no merge
- ❌ Não fazer force-push em main
- ❌ Não publicar sem validação final
- ❌ Não considerar concluído sem verificar o site publicado

---

**Nenhuma ação foi executada. Aguardando autorização explícita para:**
1. Criar tag de backup
2. Criar PR (ou merge local)
3. Push para main