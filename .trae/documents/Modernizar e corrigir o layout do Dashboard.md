## Objetivo
- Corrigir o layout quebrado do dashboard e aplicar um visual moderno, consistente e responsivo.

## Ajustes Visuais
- Header fixo com fundo translúcido/gradiente, sombra sutil e realce de link ativo.
- Tipografia e espaçamentos padronizados; uso de `Card` para seções e tabelas.
- Paleta coerente com Tailwind (utilizando `bg-gradient-to-r`, `from-*`, `to-*`, `backdrop-blur`).

## Reestruturação de Layout
- Container central com largura máxima e padding consistente.
- Grid principal 12 colunas: área de estatísticas (cards), gráficos de visão geral e listas recentes.
- Tabelas com cabeçalho sticky e corpo rolável para evitar “quebra” de layout.

## Novos Componentes (mínimos e reutilizáveis)
- `src/components/stat-card.tsx`: ícone + título + valor + delta.
- `src/components/overview-chart.tsx`: wrapper do Recharts para linha/área.
- (Opcional) `src/components/recent-table.tsx`: tabela compacta com cabeçalho sticky.

## Arquivos a editar
- `src/components/dashboard-layout.tsx`:
  - Deixar header sticky, melhorar navegação (desktop/mobile), destacar link ativo, ajustar espaçamentos.
- `src/pages/dashboard.tsx`:
  - Substituir layout atual por grid moderno:
    - Linha 1: 4 `StatCard` (Clientes, Mensais, Anuais, IRPF).
    - Linha 2: 2 gráficos (Serviços por mês/ano) usando `overview-chart`.
    - Linha 3: 2 listas “Recentes” (Mensais, Anuais) em `Card` com altura controlada.

## Integração de Dados
- Reutilizar hooks existentes:
  - `useClients` para contagem de clientes.
  - `useMonthlyServices` e `useAnnualServices` para contagens e séries (agregar por mês/ano no cliente com `Array.reduce`).
  - `useIrpfServices` para contagem.
- Evitar novas rotas; computar agregados no cliente.

## Acessibilidade e Responsividade
- Navegação mobile: botão hambúrguer simples (sem dependências novas), menu colapsável.
- Foco visível, semântica apropriada (`nav`, `header`, `main`, `section`).
- Tabelas com `aria-label` e cabeçalhos `scope`.

## Passos de Implementação
1. Atualizar `dashboard-layout.tsx` (header sticky, mobile menu, links ativos, espaçamentos).
2. Criar `stat-card.tsx` e `overview-chart.tsx` (componentes pequenos, sem lógica complexa).
3. Refatorar `pages/dashboard.tsx` para usar o novo grid e componentes.
4. Ajustar listas recentes com `Card`, altura fixa e `overflow-auto`.
5. Testar em resoluções diferentes; ajustar gaps e colunas (`md`, `lg`, `xl`).

## Validação
- `npm run type-check` e `npm run lint` sem erros.
- Visual: abrir `/dashboard` e confirmar responsividade (mobile/desktop), ausência de quebras e carregamento fluido.
- Verificar que os números e gráficos refletem os dados dos hooks existentes sem regressões.
