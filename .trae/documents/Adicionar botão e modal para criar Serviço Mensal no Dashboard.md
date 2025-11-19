## Objetivo
- Adicionar no dashboard um botão “Novo Serviço Mensal” que abre um modal com o formulário de serviços mensais, mantendo a navegação SPA.

## Mudanças de UI
- Incluir o botão “Novo Serviço Mensal” ao lado do botão “Novo Cliente” no cabeçalho da página `Dashboard`.
- Abrir um modal overlay simples (mesmo padrão já usado para “Novo Cliente”) com o formulário de serviços mensais.
- Opcional: também incluir o mesmo botão no cabeçalho da aba “Serviços Mensais” para ação contextual.

## Arquivos a editar
- `src/pages/dashboard.tsx`:
  - Adicionar estado `openMonthly` e o botão “Novo Serviço Mensal”.
  - Renderizar o modal overlay quando `openMonthly` estiver `true`, com o componente de formulário.
  - Fechar modal ao clicar no backdrop e ao concluir o envio (se houver callback).
- `src/components/monthly-service-form.tsx` (pequena melhoria):
  - Aceitar prop opcional `onSuccess?: () => void`.
  - Invocar `onSuccess()` após criação bem-sucedida e reset de campos (sem alterar a lógica de criação existente).

## Implementação
1. `dashboard.tsx`
   - Criar `const [openMonthly, setOpenMonthly] = useState(false)`.
   - Adicionar `<Button onClick={() => setOpenMonthly(true)}>Novo Serviço Mensal</Button>` no cabeçalho.
   - Adicionar modal:
     - Backdrop `div` cobrindo a tela.
     - Card central com título “Novo Serviço Mensal”, botão “Fechar”, e `<MonthlyServiceForm onSuccess={() => setOpenMonthly(false)} />`.
2. `monthly-service-form.tsx`
   - Adicionar prop `onSuccess`.
   - Após `await createMonthlyService(...)`, executar `onSuccess?.()` e limpar estado dos campos.

## Comportamento SPA
- Sem navegação; uso de React Query para invalidar listagem já cobre atualização.
- Modal e formulário funcionam 100% client-side.

## Validação
- Executar verificação de tipos e lint.
- Abrir `/dashboard` e testar:
  - Botão abre modal.
  - Selecionar cliente, preencher campos, salvar.
  - Modal fecha em sucesso e lista “Serviços Mensais” atualiza.

## Observações
- Reutiliza o padrão de modal já existente para “Novo Cliente” (evita criar novos componentes).
- Sem novas dependências; mantém consistência visual com o layout atual e as abas.