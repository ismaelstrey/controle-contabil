## Análise
- Tailwind já está configurado com `darkMode: 'class'` (tailwind.config.ts:4).
- Variáveis CSS definidas em `:root` e sobrescritas em `.dark` (src/styles/globals.css:5–26, 28–48); todos os componentes usam `bg-background`/`text-foreground`, então basta alternar a classe `dark` no `html` para aplicar o tema.
- Há `AppProvider` com estado `theme` e `setTheme` (src/contexts/app-context.tsx:27–45), ainda não aplicado no DOM.
- Ponto ideal do botão: cabeçalho em `DashboardLayout` (src/components/dashboard-layout.tsx:19–33), ao lado do botão `Sair`, com ícone e sem rótulo visível.

## Solução
- Inicialização automática pelo navegador: se não existir preferência persistida, detectar `prefers-color-scheme: dark` e aplicar `dark` como tema inicial.
- Persistência: ao usuário alternar, salvar em `localStorage('theme')` para manter a escolha entre sessões.
- Aplicação do tema: alternar classe `dark` no `document.documentElement` sempre que o valor do tema mudar.
- Botão discreto: ícone `Moon`/`Sun` (lucide-react), `variant="secondary"`, tamanho pequeno, `aria-label` para acessibilidade.
- Opcional (anti-flash): script inline em `_document.tsx` para aplicar o tema antes da hidratação, evitando FOUC.

## Implementação
1) Contexto de Tema
- Atualizar `AppProvider` para:
  - Ler `localStorage('theme')` na montagem; se não existir, usar `matchMedia('(prefers-color-scheme: dark)')` para definir o estado inicial.
  - Sincronizar classe `dark` em `document.documentElement` em um `useEffect` dependente de `theme`.
  - Ao chamar `setTheme('dark'|'light')`, persistir em `localStorage`.

2) Componente `ThemeToggle`
- Criar `src/components/theme-toggle.tsx`:
  - `useAppContext()` para ler/alterar `theme`.
  - Renderizar `Button` ícone-only: quando tema for `dark`, mostrar `Sun`; senão, `Moon`.
  - `onClick` alterna entre `light`/`dark` e atualiza `localStorage`.

3) Integrar no Layout
- Em `src/components/dashboard-layout.tsx`, importar `ThemeToggle` e posicionar ao lado de `Sair` tanto na versão desktop (linha ~29–32) quanto móvel (linha ~23–27).

4) (Opcional) Evitar FOUC
- Criar `src/pages/_document.tsx` com script inline:
  ```js
  const t = localStorage.getItem('theme');
  const d = t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches);
  if (d) document.documentElement.classList.add('dark');
  ```
  - Executado antes da hidratação para reduzir flashes.

## Locais e Mudanças
- `src/contexts/app-context.tsx`: adicionar efeitos de inicialização/persistência/aplicação da classe.
- `src/components/theme-toggle.tsx`: novo componente com ícone e toggle.
- `src/components/dashboard-layout.tsx`: incluir o botão.
- `src/pages/_document.tsx` (opcional): script anti-flash.

## Verificação
- Abrir `/dashboard` com o navegador em dark mode, sem preferência salva: tema deve iniciar em dark.
- Alternar pelo botão: classe `dark` no `html` deve ligar/desligar; conteúdo muda sem recarregar.
- Recarregar a página: manter última preferência.
- Testar em mobile e desktop: botão discreto presente em ambos.

## Acessibilidade e UX
- `aria-label` no botão (ex.: "Alternar tema").
- Ícone-only para ser discreto; foco visível via estilos do `Button`.
- Sem texto adjacente para manter cabeçalho limpo.

## Extensões Futuras
- Ouvir mudanças de `prefers-color-scheme` se não houver preferência do usuário.
- Expor controle em configurações globais via `AppProvider` se desejado.

Confirma seguir com esta implementação?