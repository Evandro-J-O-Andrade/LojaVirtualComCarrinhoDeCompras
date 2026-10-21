# Gate 6.1 — Referências para estudo da Angel Cosméticos

**Projeto:** Angel Cosméticos — e-commerce
**Status:** READ-ONLY — estudo de referências; nenhuma alteração em código, banco, migrations, Supabase ou Git
**Data:** 2026-09-19

---

## Regra do Gate 6.1

**REFERÊNCIA ≠ REUTILIZAÇÃO**

As referências servem para observar, documentar e comparar soluções. Elas não autorizam, por si só, a adoção de uma decisão na Angel.

Não serão copiados ou trazidos para a Angel:

- código, componentes ou utilitários;
- tabelas, migrations ou procedures;
- RBAC, multi-tenancy ou estruturas enterprise específicas;
- decisões de arquitetura baseadas apenas na existência da solução na referência.

Para cada achado, a análise seguirá:

```text
Referência encontrada
        ↓
O que ela resolve?
        ↓
É necessário na Angel?
        ↓
Combina com o domínio da Angel?
        ↓
Há uma solução melhor?
        ↓
Decisão independente da Angel
```

Classificações possíveis: **REFERÊNCIA**, **AVALIAR**, **ADAPTAR**, **NÃO REUTILIZAR** ou **NÃO APLICÁVEL**. A classificação não implica implementação.

---

## Fase 1 — Escopo e inventário inicial

### 1.1 Estado do workspace

| Item | Evidência |
|---|---|
| Workspace | `D:\LojaVirtualComCarrinhoDeCompras` |
| Repositório Git | Sim; branch `main`; commit de referência `612aea4` |
| Estado Git | Árvore de trabalho contém arquivos não rastreados existentes; nenhuma alteração foi feita nesta fase |
| Frontend moderno | `web/` — React, TypeScript, Vite |
| Legado | `assets/` — HTML/CSS/JS/PHP/SQL |
| Chat | `chat/` — Node.js |
| Documentos oficiais da Angel | `DECISOES_NEGOCIO_v1.3.md`, `CONTRATO_DOMINIO_COMERCIAL_v1.1.md`, `AUDITORIA_3_DOMAIN_CONTRACT.md` |

### 1.2 Referências localizadas

| Referência | Caminho local | Perfil | Foco do Gate 6.1 |
|---|---|---|---|
| J&S Empregos LTDA | `references/jstercerizados` | Site/SaaS de RH, React/TypeScript/Vite/Tailwind | UX, navegação, responsividade, organização de produto e padrões de aplicação |
| Pedacinho de Felicidade | `references/pedacinho-de-felicidade` | E-commerce de confeitaria, React/Vite | Experiência de compra, vitrine, produto, carrinho, kit, checkout e navegação |
| AtendimentoOfflineAlpha | `references/AtendimentoOfflineAlpha` | Plataforma enterprise de saúde, monorepo TypeScript | Atendimento, suporte, comunicação, fluxos e experiência operacional |

Inventário local aproximado:

- J&S Empregos LTDA: 1.835 arquivos;
- Pedacinho de Felicidade: 239 arquivos;
- AtendimentoOfflineAlpha: 5.445 arquivos.

### 1.3 Escopo de análise por fase

1. **J&S Empregos LTDA:** padrões de UX, navegação, responsividade, acessibilidade, organização visual e transições entre site público e áreas internas.
2. **Pedacinho de Felicidade:** jornada de compra, vitrine, ficha de produto, seleção de opções, carrinho, kit, feedbacks, checkout e WhatsApp.
3. **AtendimentoOfflineAlpha:** atendimento humano, suporte, comunicação, estados de solicitação, canais, acessibilidade e experiência operacional.
4. **Consolidação:** comparar os achados com o domínio oficial da Angel e registrar apenas decisões candidatas, sem implementação.

### 1.4 Conflito documental identificado

`GATE_6_1_INVENTARIO_BIBLIOTECAS.md` ainda registra acesso aos outros projetos como “AGUARDANDO ACESSO”, embora as três referências estejam presentes localmente em `references/`. Esse status é considerado desatualizado para o Gate 6.1 e será tratado apenas na consolidação; o conteúdo do inventário não será presumido como decisão vigente.

Também há conclusões antigas no inventário que misturam estudo de referência com decisão de reutilização/adoção. Elas serão reavaliadas sob a regra atual **REFERÊNCIA ≠ REUTILIZAÇÃO**, sem alterar o inventário nesta fase.

### 1.5 Limites desta fase

- Nenhuma referência foi copiada.
- Nenhum arquivo de código, schema, migration, configuração ou documentação de referência foi alterado.
- Nenhuma decisão de arquitetura da Angel foi tomada.
- A análise detalhada de cada referência começa na fase seguinte.

---

**Próxima fase:** J&S Empregos LTDA — UX, navegação, responsividade e organização de produto.

---

## Fase 2 — J&S Empregos LTDA

**Fonte:** `references/jstercerizados`  
**Papel no Gate 6.1:** referência de UX, navegação, responsividade, acessibilidade e organização de produto.  
**Limite:** nenhuma solução foi copiada, importada ou considerada automaticamente adequada à Angel.

### 2.1 O que foi observado

#### Navegação e organização por contexto

- O projeto separa rotas públicas, área de candidato e dashboard/portal, com shells e guardas diferentes (`src/app/App.tsx:323-879`).
- A navegação pública usa header fixo com dropdowns e drawer mobile (`src/components/layout/Navbar.tsx:89-614`).
- A área de candidato usa bottom navigation; o portal usa sidebar recol hível (`src/components/portal/CandidateBottomNavigation.tsx:86-148`, `src/components/portal/PortalSidebar.tsx:285-656`).
- Ações flutuantes de acessibilidade e chat são ocultadas no portal (`src/components/layout/FloatingHelpWidgets.tsx:7-61`).

**Leitura para a Angel:** a separação por contexto é útil como referência para distinguir loja pública, conta do cliente e administração. A quantidade de personas, níveis de menu e guardas do projeto de RH não deve ser transplantada.

#### Padrões visuais e de catálogo

- Existem wrappers de seção e container responsivos (`src/components/layout/Section.tsx:1-18`, `src/components/layout/Container.tsx:1-16`).
- Há variantes de card, cards de serviço e cards de listagem com imagem, título, descrição, badges, tags e CTA (`src/components/ui/Card.tsx:1-30`, `src/components/sections/ServiceCard.tsx:1-95`, `src/pages/Vagas/Vagas.tsx:395-496`).
- A vitrine de vagas combina busca, filtros, contador e estados de carregamento, erro e vazio (`src/pages/Vagas/Vagas.tsx:205-516`).
- A página inicial é organizada em blocos sequenciais com hierarquia e CTAs (`src/pages/Home/Home.tsx:208-818`).

**Leitura para a Angel:** a estrutura de blocos, os estados de dados e a composição visual de cards são referências relevantes para organizar categorias, produtos, filtros e chamadas de compra. O domínio de “vaga/serviço” e seus campos não se aplicam à Angel.

#### Responsividade e mobile

- O projeto adota mobile-first com `sm:` e `lg:`.
- Bottom navigations ficam fixas no mobile, respeitam safe area e são ocultadas em telas grandes.
- O drawer móvel possui foco trap, fechamento por Escape e restauração de foco.
- Footer usa accordions no mobile.
- Há cuidados com overflow, truncamento de texto e áreas de toque.

**Leitura para a Angel:** a navegação por polegar, o drawer acessível e os estados responsivos são referências fortes para a experiência mobile de compra. A Angel deve validar esses padrões com sua própria arquitetura e identidade visual.

#### Acessibilidade e feedback

- O widget de acessibilidade oferece tamanho de fonte, alto contraste, redução de movimento, foco, TTS e persistência (`src/components/ui/AccessibilityWidget.tsx:39-543`).
- Botões e controles usam foco visível; menus usam `aria-expanded`, `aria-haspopup` e foco trap.
- `DataState` cobre loading, erro, vazio, não encontrado, não autorizado e sucesso (`src/components/ui/DataState.tsx:1-157`).
- Há loaders, skeletons, toasts e ErrorBoundary global (`src/components/ui/SectionLoader.tsx:1-59`, `src/components/ui/Toast.tsx:1-100`, `src/components/errors/ErrorBoundary.tsx:1-100`).
- `SafeImage` trata pré-carregamento, skeleton, fallback e erro de imagem (`src/components/ui/SafeImage.tsx:1-174`).

**Leitura para a Angel:** estados de feedback e tratamento de imagem são referências especialmente úteis, pois a Angel possui `alert()` e feedbacks incompletos no estado atual. O conjunto completo de acessibilidade precisa ser avaliado por necessidade, custo e impacto no e-commerce.

#### SEO e conteúdo

- O componente SEO registra metadados, Open Graph, Twitter Cards, canonical e JSON-LD por página (`src/components/seo/SEO.tsx:1-148`).
- A página de listagem demonstra uma sequência útil: filtros → estados → resultados → ações.

**Leitura para a Angel:** a preocupação com SEO por produto/categoria é relevante para vitrine pública. A implementação e os schemas devem ser definidos independentemente para o domínio Angel.

### 2.2 Riscos e anti-padrões observados

| Risco | Evidência | Leitura para a Angel |
|---|---|---|
| Abertura cinematográfica muito pesada | `CinematicShowcase.tsx:1-366` | Não copiar; pode prejudicar conversão e performance |
| Sidebar com três níveis de profundidade | `PortalSidebar.tsx:192-525` | Complexidade desnecessária para um e-commerce simples |
| Muitas animações Framer Motion | `Navbar.tsx`, `Footer.tsx`, `HeroSplit.tsx`, `Toast.tsx` | Avaliar bundle e priorizar performance |
| Mock services no fluxo principal | `src/services/mock/` | A Angel deve partir de dados reais do backend |
| CSS utilitário customizado extensivo | `src/styles/index.css:213-589` | Preferir padrão próprio, simples e consistente |
| Identidade hardcoded em vários componentes | `CinematicShowcase.tsx`, `Footer.tsx`, `Navbar.tsx` | Manter identidade da Angel em configuração própria |
| Imports estáticos em parte do dashboard | `App.tsx:19-176` | Considerar lazy loading por rota, sem copiar a implementação |

### 2.3 Matriz de referência — decisão ainda não tomada

| Achado | O que resolve | Relevância para Angel | Classificação Gate 6.1 | Decisão da Angel |
|---|---|---:|---|---|
| Separação de contextos de navegação | Clareza entre loja, conta e administração | Alta | REFERÊNCIA | Pendente |
| Header responsivo com drawer e foco trap | Navegação móvel acessível | Alta | REFERÊNCIA | Pendente |
| Bottom navigation com safe area | Navegação mobile por polegar | Alta | REFERÊNCIA | Pendente |
| Cards com imagem, badges, tags e CTA | Composição visual de catálogo | Alta | REFERÊNCIA | Pendente |
| Filtros + estados loading/error/empty | Vitrine previsível e comunicativa | Alta | REFERÊNCIA | Pendente |
| DataState, skeletons e toasts | Feedback assíncrono consistente | Alta | REFERÊNCIA | Pendente |
| SafeImage com fallback | Proteção da vitrine contra falhas de mídia | Alta | REFERÊNCIA | Pendente |
| ErrorBoundary global | Recuperação de falhas de renderização | Alta | REFERÊNCIA | Pendente |
| SEO dinâmico por página | Visibilidade de categorias e produtos | Alta | REFERÊNCIA | Pendente |
| Widget completo de acessibilidade | Inclusão de usuários com necessidades específicas | Média | AVALIAR | Pendente |
| Hero com múltiplas animações | Impacto visual de abertura | Média | AVALIAR | Pendente |
| Sidebar enterprise em três níveis | Navegação de muitos módulos | Baixa | NÃO REUTILIZAR | Pendente |
| Abertura cinematográfica longa | Apresentação institucional | Baixa | NÃO REUTILIZAR | Pendente |
| RBAC com 14 roles | Controle granular enterprise | Baixa | NÃO APLICÁVEL | Pendente |
| Multi-tenancy e billing SaaS | Isolamento entre organizações e assinatura | Baixa | NÃO APLICÁVEL | Pendente |

### 2.4 Resultado da fase

A referência é mais útil para **padrões de experiência e comunicação visual** do que para arquitetura. Os achados acima serão comparados com o domínio oficial da Angel na fase 5. Nenhuma decisão de implementação foi tomada.

**Próxima fase:** Pedacinho de Felicidade — experiência e-commerce, carrinho, produto, kit, checkout e WhatsApp.

---

## Fase 4 — AtendimentoOfflineAlpha

**Fonte:** `references/AtendimentoOfflineAlpha`  
**Papel no Gate 6.1:** referência de atendimento, suporte, comunicação, fluxos de solicitação, canais, experiência operacional, acessibilidade e feedback.  
**Limite:** a plataforma de saúde é muito maior e mais complexa que a Angel. Sua arquitetura enterprise, multi-tenancy, módulos hospitalares, tabelas, procedures e código não são candidatos de reaproveitamento.

### 4.1 O que foi observado

#### Ciclo de vida de atendimento

- A documentação descreve um fluxo omnichannel: canal de entrada → identificação do cliente → histórico → ticket contextualizado → automação para casos simples → humano para casos complexos → solução registrada → evento de acompanhamento (`docs/canonical/MD-073-SAC-Omnichannel.md:99-117`).
- O ciclo de vida do ticket é: abertura → classificação → prioridade → atribuição → resposta → solução → encerramento → reabertura (`MD-073-SAC-Omnichannel.md:41-53`, `MAP-016-SAC-Domain-Architecture.md:50-61`).
- Eventos como ticket criado, atribuído, SLA vencendo, resolvido e encerrado dão rastreabilidade ao fluxo (`MAP-016-SAC-Domain-Architecture.md:114-129`).

**Leitura para a Angel:** a semântica de acompanhamento de uma solicitação é relevante para suporte pós-venda, pedidos, trocas e dúvidas. A Angel deve definir um fluxo proporcional, sem importar a camada enterprise.

#### Canais e comunicação

- Canais documentados: chat, WhatsApp, e-mail, telefone, redes sociais, app mobile, portal, totem, kiosk, push e webhook (`MD-073-SAC-Omnichannel.md:23-35`).
- O Notification Center separa inbox, painel, página, preferências e toast, com prioridades e canais de entrega (`docs/canonical/FRONT-013-Notification-Center.md:146-206`, `MD-088-Global-Notification-Center.md:27-39`).
- A automação pode fazer triagem e sugerir respostas, mas a responsabilidade por casos complexos permanece humana (`MD-073-SAC-Omnichannel.md:87-95`, `MD-081-AI-Copilot-Framework.md:49-107`).

**Leitura para a Angel:** a referência é útil para organizar canais, preferências, histórico e handoff entre bot e humano. A Angel deve manter WhatsApp como canal de suporte/continuidade, não como mecanismo inseguro de confirmação de pedido.

#### Estados, prioridade, SLA e ownership

- A documentação prevê prioridade, fila, atribuição, SLA de resposta/resolução, escalonamento e satisfação pós-atendimento (`MD-073-SAC-Omnichannel.md:41-76`).
- A experiência de notificações cobre loading, erro com retry, vazio, parcial, desatualizado e ausência de permissão (`FRONT-013-Notification-Center.md:222-246`).
- Aprovações têm estados, justificativa obrigatória para reprovação e histórico imutável (`FRONT-023-Approval-Center.md:75-109`).

**Leitura para a Angel:** estados claros e histórico de atendimento são referências fortes para área do cliente e administração. SLA e prioridade só devem entrar se houver operação que realmente os utilize.

#### Acessibilidade e continuidade

- A referência exige leitores de tela, teclado, contraste, texto alternativo, ARIA, zoom e foco visível (`FRONT-018-Accessibility-Experience.md:18-31`, `FRONT-011-Design-System-Enterprise.md:253-265`).
- O conceito offline-first cobre cache, fila local, sincronização e reconciliação (`FRONT-040-Offline-First-Experience.md:31-41`).
- Mobile/PWA inclui toque, push e continuidade operacional; totem e painéis de fila existem para contextos físicos (`FRONT-016-Mobile-Native-Experience.md`, `FRONT-032-Queue-Panel-Experience.md`).

**Leitura para a Angel:** acessibilidade é requisito transversal. Offline-first, totem e painéis de fila são apenas candidatos de avaliação, dependendo de lojas físicas e operação presencial.

### 4.2 Riscos e anti-padrões observados

| Risco | Evidência | Leitura para a Angel |
|---|---|---|
| Complexidade enterprise desproporcional | Constituição e documentos canônicos descrevem Portal, Apps, Packages, Kernel, Event Store e múltiplos domínios | Manter a Angel simples e orientada ao e-commerce |
| Multi-tenancy obrigatória | `000-CONSTITUICAO-IA.md:499-510`, `MD-110-Canonical-Laws.md:199-210` | Não aplicar à marca única sem nova necessidade de negócio |
| Domínio hospitalar | HIS, FFA, triagem, prontuário, farmácia e filas clínicas | Não aplicável à Angel |
| Documentação muito densa e freeze | `README_CONSOLIDACAO.md:5-13`, `README_CANONICO.md:7-59` | Usar documentação enxuta e evolutiva |
| Frontend majoritariamente stub | `frontend-inventory.md:165-179` | Não tratar documentação como evidência de implementação |
| Backend com dados vazios | `frontend-runtime-discovery.md:145-160` | Exigir evidência real antes de copiar padrões operacionais |
| Dispatcher/Orquestrador/Executor/SP/Ledger | `backend/src/core/dispatcher/DispatcherService.ts` | Arquitetura excessiva para o estágio atual da Angel |
| Metas de performance sem base real | `FRONT-019-Performance-UX.md:10-31` | Definir métricas e medir antes de decidir |

### 4.3 Matriz de referência — decisão ainda não tomada

| Achado | O que resolve | Relevância para Angel | Classificação Gate 6.1 | Decisão da Angel |
|---|---|---:|---|---|
| Ciclo de vida de ticket | Organização de suporte e pós-venda | Alta | REFERÊNCIA | Pendente |
| Omnicanalidade com histórico compartilhado | Evita repetição de informações entre canais | Alta | REFERÊNCIA | Pendente |
| Handoff bot → humano | Triagem sem remover responsabilidade humana | Média | AVALIAR | Pendente |
| Estados loading/error/empty/partial/stale | Comunicação clara em telas operacionais | Alta | REFERÊNCIA | Pendente |
| Notification Center e preferências | Notificações organizadas e não invasivas | Alta | REFERÊNCIA | Pendente |
| Prioridade, fila e SLA | Operação de suporte previsível | Média | AVALIAR | Pendente |
| Histórico e rastreabilidade | Auditoria e continuidade do atendimento | Alta | REFERÊNCIA | Pendente |
| Feedback/CSAT pós-atendimento | Melhoria contínua do suporte | Alta | REFERÊNCIA | Pendente |
| Acessibilidade WCAG AA | Inclusão e conformidade | Alta | REFERÊNCIA | Pendente |
| Customer 360 simplificado | Visão única de cliente, pedidos e interações | Alta | REFERÊNCIA | Pendente |
| Offline-first | Continuidade em operação presencial | Baixa/Média | AVALIAR | Pendente |
| Totem e painéis de fila | Atendimento em loja física com demanda presencial | Baixa | AVALIAR | Pendente |
| Multi-tenancy | Isolamento entre organizações | Baixa | NÃO REUTILIZAR | Pendente |
| HIS e fluxos hospitalares | Domínio de saúde | Baixa | NÃO APLICÁVEL | Pendente |
| Dispatcher/Event Store/SP/Ledger | Orquestração enterprise | Baixa | NÃO REUTILIZAR | Pendente |
| Monorepo e 1.300+ documentos | Governança de plataforma grande | Baixa | NÃO REUTILIZAR | Pendente |
| Stubs e backend vazio | Estado incompleto da referência | Baixa | NÃO APLICÁVEL | Pendente |

### 4.4 Resultado da fase

AtendimentoOfflineAlpha é útil como **biblioteca de padrões de experiência de atendimento**, especialmente ciclo de vida, canais, histórico, notificações, feedback e acessibilidade. É também uma advertência contra overengineering: a Angel deve extrair a semântica de experiência e construir uma operação proporcional ao seu domínio.

**Próxima fase:** consolidação comparativa das três referências com o domínio oficial da Angel, registrando apenas decisões candidatas e mantendo tudo sem alteração de código, banco, migrations, Supabase ou Git.

