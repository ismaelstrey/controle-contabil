## Diagnóstico
- Muitos componentes usam cores fixas claras: `bg-white`, `bg-gray-50`, `text-gray-600/500/400`, cabeçalhos com `bg-*50` (green/indigo/amber/violet), e `bg-white/70`.
- Isso impede a adaptação automática ao dark mode, que no projeto depende de variáveis CSS e tokens (`bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`, `bg-muted`).
- Locais principais a corrigir:
  - `src/pages/dashboard.tsx`: linhas 98, 121, 122, 135, 136, 149, 150, 163, 164
  - `src/components/dashboard-layout.tsx`: linhas 19, 20, 24, 32, 38
  - Tabelas (`thead`): `client-list.tsx:23`, `monthly-service-list.tsx:28`, `annual-service-list.tsx:28`, `irpf-service-list.tsx:28`, `irpf-list.tsx:23`
  - Dialog: `src/components/ui/dialog.tsx:27`
  - Tabs: `src/components/ui/tabs.tsx:71`
  - Cards/labels: `overview-chart.tsx:18`, `stat-card.tsx:19,21,23`, `client-detail.tsx:19,20`
  - Páginas públicas: `src/pages/login.tsx:40,92` e `src/pages/index.tsx:19,21,22,37`
  - Toast: `src/components/ui/toast-container.tsx:15–17` (cores fixas por estado).

## Estratégia de Correção
1) Wrappers e Layout
- Substituir `bg-gradient-to-br from-gray-50 to-white` por `bg-background`.
- Ajustar header `bg-white/70` para `bg-card/70`.
- Textos auxiliares `text-gray-600` → `text-muted-foreground`.
- Menus móveis `bg-white` → `bg-card`.

2) Painéis e Seções do Dashboard
- Trocar `rounded-lg border bg-white` por `rounded-lg border bg-card`.
- Cabeçalhos com `bg-*50 text-*700` → `bg-muted text-muted-foreground` (mantendo `border-b`).
- `TabsList` `bg-white/60` → `bg-card/60` ou remover e usar superfície padrão.

3) Tabelas
- `thead.bg-gray-50` → `bg-muted`.
- Garantir corpo usa `text-foreground`/`text-muted-foreground` conforme semântica.

4) Componentes UI compartilhados
- `Dialog` content `bg-white` → `bg-card`.
- `Tabs` triggers inativos `text-gray-600` → `text-muted-foreground` mantendo classes de hover/border.
- `StatCard` e `OverviewChart` subtítulos `text-gray-*` → `text-muted-foreground`.
- `ClientDetail` metas `text-gray-600` → `text-muted-foreground`.

5) Páginas Públicas
- `login/index` containers `bg-gray-50` e textos `text-gray-*` → `bg-background` e `text-muted-foreground`.

6) Toast (estado)
- Primeira etapa: alinhar fundo para `bg-card` e usar `text-foreground`; aplicar um `border-l-2` colorido por tipo para manter diferenciação sem quebrar dark mode.
- Opcional etapa 2: tokens customizados para estados se quisermos paletas adaptativas.

## Verificação
- Alternar tema pelo `ThemeToggle` em `/dashboard` e checar: seções, tabelas, tabs, dialogs, cards, toasts.
- Abrir `login` e `index` e garantir contraste correto em dark.
- Uso de tokens garante que `.dark` em `html` propague para todos.

## Entregáveis
- Refactor nos arquivos listados, substituindo classes fixas por tokens.
- Manter o design; mudanças focam em cores e superfícies.
- Comentários não serão adicionados, seguindo o padrão do projeto.

Posso aplicar estas correções agora?