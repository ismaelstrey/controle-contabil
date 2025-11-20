## Objetivo
Criar um modal de criação de usuário com 3 steps (Dados Básicos → Informações Complementares → Configurações de Acesso), validação por etapa, progressão clara, e submissão apenas no último step, mantendo o padrão de UI/UX atual sem adicionar libs de formulário.

## Componentes e Padrões
- Reutilizar `Dialog`, `Button`, `Input`, `Label` já existentes (consistência de design).
- Tailwind para layout responsivo; sem libs extras.
- Acessibilidade: labels, `aria-live` para erros, foco gerenciado ao avançar/voltar.

## Estrutura de Arquivo
- Criar `src/components/user-create-modal.tsx`:
  - Recebe `open`, `onOpenChange`, `onSuccess?`.
  - Gerencia estado dos campos e do step atual.
  - Renderiza cabeçalho com indicador de progresso (1/3, 2/3, 3/3).
  - Botões “Anterior/Próximo” e “Criar Usuário” no step final.

## Campos por Step
- Step 1: Dados básicos (obrigatórios)
  - `name` (Nome completo) — required
  - `email` — required, regex de email
  - `phone` — opcional, com máscara `(00) 00000-0000`
- Step 2: Informações complementares
  - Endereço: `street`, `number`, `complement`, `city`, `state`, `zip_code` (CEP `00000-000`)
  - `data_nascimento` (input `type="date"`)
- Step 3: Configurações de acesso
  - `password` (senha, input type password)
  - `role` (permissões: dropdown `admin`/`user`)

## Validações e Máscaras
- Validação em tempo real por campo (onChange) e bloqueio ao avançar:
  - Step 1: `name` não vazio, `email` com regex válida, `phone` se presente com 10–11 dígitos.
  - Step 2: `zip_code` se presente com 8 dígitos.
  - Step 3: `password` com critérios mínimos (p.ex. ≥ 6), `role` obrigatório.
- Máscaras implementadas via funções utilitárias simples (JS):
  - `digitsOnly`, `maskPhone`, `maskCep` dentro do componente.
- Feedback de erro inline abaixo dos inputs; `aria-live="polite"` em contêiner de erros.

## Navegação e Progresso
- Barra/indicador simples de steps (3 marcadores ou texto “Etapa X de 3”).
- Botões:
  - Step 1/2: “Próximo” habilitado somente se a etapa estiver válida; “Anterior” no step 2/3.
  - Step 3: “Criar Usuário” habilitado somente se válido.
- Foco automático no primeiro campo da etapa ao navegar.

## Integração com API
- Submissão no step 3 via `fetch('/api/auth/register', { method: 'POST', body: { name, email, password } })`.
- Opcional: após registro, atualizar `User` via endpoint `src/pages/api/users/[id].ts` (se necessário) para salvar `phone`, `address`, `data_nascimento`, `role`; ou consolidar tudo em um endpoint dedicado (`/api/users`) caso exista.
- Usar `useToastContext` para feedback de sucesso/erro e fechar o modal com `onSuccess`.

## Responsividade e Acessibilidade
- Grid responsivo (1 coluna no mobile, 2 em telas maiores) para os grupos de inputs.
- Labels claras, `aria-describedby` nos erros, `tabIndex` coerente.
- Botões com estados desabilitados, loading (opcional) na submissão.

## Testes e Verificação
- Validação manual em desenvolvimento: avançar/voltar steps, verificar bloqueios, submissão final.
- Opcional: testes unitários das funções de máscara/validação (reaproveitar padrão já adotado em `doc-validation`).

## Entregáveis
- Novo componente `user-create-modal.tsx` pronto para uso em páginas de gestão de usuários.
- Validações e máscaras básicas embutidas.
- Integração com API de cadastro e feedback visual consistente.

Confirma para eu implementar o componente e integrar com a rota de registro de usuário no projeto.