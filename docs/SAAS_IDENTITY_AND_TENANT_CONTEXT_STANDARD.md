# Padrão SaaS de Identidade e Contexto de Tenant

## 1. Princípio fundamental

O usuário autenticado deve ter uma identidade completa, resolvida pelo sistema. Não basta obter o e-mail do `auth.users`. Precisamos resolver:

- ID real do usuário (`auth.uid()`)
- Nome completo (`%fullnameuser%`)
- E-mail
- Perfil e dados pessoais
- Tenant ativo
- Membership no tenant
- Papel (role)
- Permissões efetivas
- Contexto de acesso
- Situação da conta

O nome apresentado nas telas deve vir do perfil real, nunca de uma substituição improvisada pelo e-mail.

## 2. Arquitetura padrão

```
Supabase Auth
  Identidade única e UUID do usuário
      |
      v
Perfil / Pessoa
  %fullnameuser% — nome completo, dados pessoais, identificação
      |
      v
Tenant Context
  Tenant ativo, membership e situação de acesso
      |
      v
RBAC
  Roles, permissões e escopo de autorização
      |
      v
Aplicação SaaS
  Admin, conta, loja, módulos e operações
```

Essa resolução deve acontecer centralmente, não separadamente em cada página.

## 3. Camadas de identidade

| Camada | Responsabilidade | Tabela/Fonte |
|--------|-----------------|--------------|
| `auth.users` | Autenticação | Supabase Auth |
| Perfil/Pessoa | Identidade e nome completo | `perfil` ou `pessoa` (a definir por projeto) |
| `cliente` | Dados comerciais do consumidor | `public.cliente` |
| Tenant | Organização proprietária dos dados | `tenant` (a definir por projeto) |
| Membership/RBAC | Acesso administrativo e operacional | `membership`, `role`, `permission` |

## 4. Regras de identidade

1. O UUID do usuário (`auth.uid()`) é a chave primária de identidade em todo o sistema.
2. O nome completo (`%fullnameuser%`) deve ser armazenado em um perfil central, não derivado do e-mail.
3. O `auth_user_id` em tabelas de domínio (como `cliente`) deve referenciar `auth.users.id`.
4. Cada usuário pertence a pelo menos um tenant via membership.
5. O papel (role) define o que o usuário pode fazer dentro do tenant.
6. Permissões são resolvidas no backend (RLS + RBAC), nunca no frontend.
7. O contexto de tenant é resolvido centralmente, não por página.

## 5. Separação de domínios

- **Padrão compartilhado**: identidade, resolução de nome, contexto de tenant, autorização, auditoria e contratos.
- **Domínio independente**: clientes da Angel, candidatos da J&S, funcionários de outros SaaS e seus respectivos relacionamentos comerciais.

Os projetos continuam com bancos e estruturas independentes. Reutilizamos o padrão arquitetural, não copiamos tabelas cegamente.

## 6. Fluxo de cadastro (Auth → Cliente → Admin)

```
Cadastro público (site)
      |
      v
Supabase Auth (signUp)
      |
      v
Identidade do usuário (auth.users)
      |
      v
Perfil / nome completo (perfil central)
      |
      v
Tenant ativo (membership)
      |
      v
Cadastro comercial (public.cliente)
      |
      v
Admin / Gestão de clientes
```

### Regras do fluxo:
- O `signUp` deve retornar o objeto `user` para que o `auth_user_id` seja disponível imediatamente
- A criação do `cliente` deve usar o `user.id` retornado, não chamar `getUser()` separadamente
- Erros na criação do `cliente` devem ser apresentados ao usuário, não ocultados
- Se a confirmação de e-mail estiver habilitada, o `cliente` deve ser criado com `auth_user_id` null e vinculado posteriormente via trigger ou Edge Function
- O Admin deve consultar `public.cliente` com RLS adequada

## 7. Regras de isolamento

1. Cada tenant tem seus próprios dados (produtos, clientes, pedidos, etc.)
2. RLS garante que um usuário só acessa dados do seu tenant
3. O frontend nunca decide permissões — apenas consulta o backend
4. O ROOT/admin global tem acesso cross-tenant mas via backend (SECURITY DEFINER functions)
5. Políticas antigas (baseadas em e-mail/JWT) devem ser substituídas por políticas baseadas em `auth.uid()` e `cliente.auth_user_id`

## 8. O que não fazer

- Não criar uma segunda tabela de identidade
- Não criar um segundo mecanismo de autenticação
- Não derivar o nome do usuário do e-mail
- Não conceder privilégios indiscriminadamente
- Não confiar em `user_metadata` para autorização
- Não duplicar funcionalidades entre projetos
- Não inventar tabelas ou campos sem contrato documentado

## 9. Aplicação na Angel Cosméticos

### Estado atual:
- `auth.users`: Supabase Auth (funcional)
- `public.cliente`: cadastro comercial (parcial — RLS e vínculo com auth_user_id precisam de revisão)
- `admin_user`: tabela de administradores (existe, vinculada a auth.uid())
- `is_admin()`: função SECURITY DEFINER (funcional)
- `AuthContext`: resolve identidade (parcial — não resolve nome completo nem tenant)
- `AccountContext`: resolve perfil (parcial — busca por e-mail, não por auth_user_id)

### Lacunas identificadas:
1. `signUp` não retornava o user (corrigido em b5963d2)
2. Cadastro silenciava erros de criação de cliente (corrigido em b5963d2)
3. `AccountContext` busca perfil por e-mail em vez de auth_user_id
4. Não existe resolução de tenant/membership
5. RLS de `cliente` pode bloquear insert por usuário não autenticado
6. Políticas antigas baseadas em e-mail convivem com políticas baseadas em UUID

### Próximos passos (requerem aprovação):
1. Criar trigger ou Edge Function para criação automática de `cliente` ao cadastrar em `auth.users`
2. Adicionar unique constraint em `cliente.email` (após verificar duplicidades)
3. Revisar RLS de `cliente` para permitir insert por usuário autenticado
4. Implementar resolução de perfil central (nome completo, tenant, membership)
5. Migrar `AccountContext` para buscar por `auth_user_id` em vez de e-mail
