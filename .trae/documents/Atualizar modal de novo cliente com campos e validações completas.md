## Objetivo
Expandir o modal/formulário de criação de cliente para incluir todos os campos obrigatórios e adicionais, com máscaras e validações, mantendo consistência de UI/UX e a regra de exclusividade CPF/CNPJ.

## Padrões e Componentes
- Reutilizar componentes existentes: `Input`, `Label`, `Button`, `Dialog` (shadcn-like) para consistência visual.
- Layout responsivo em grid (Tailwind) com agrupamento por seção (Dados pessoais, Contato, Documentos, Endereço, Acessos, Status/Observações).
- Datepicker: usar `input type="date"` nativo para simplicidade e compatibilidade (não há lib de datepicker usada no projeto).

## Campos e Máscaras
- Básicos (obrigatório):
  - `Nome completo` (`name`) — `Input` text, required.
  - `E-mail` (`email`) — `Input` email, required; valida regex.
  - `CPF` (`cpf`) — `Input` text com máscara `000.000.000-00`; valida tamanho e dígitos; obrigatório.
  - `Telefone` (`phone`) — `Input` text com máscara `(00) 00000-0000`.
- Adicionais:
  - `Data de Nascimento` (`data_nascimento`) — `input type="date"`.
  - `Endereço` (`address`): `street`, `number`, `complement`, `city`, `state`, `zip_code` (CEP com máscara `00000-000`).
  - `CNPJ` (`cnpj`) — `Input` text com máscara `00.000.000/0000-00`; opcional; valida tamanho e dígitos.
  - `Senha Gov` (`senha_gov`) — `Input` type password.
  - `Código de Acesso` (`codigo_acesso`) — `Input` text.
  - `Senha NFSe` (`senha_nfse`) — `Input` text.
  - `Código Regularize` (`codigo_regularize`) — `Input` text.
  - `Status` (`status`) — dropdown: `Ativo`/`Inativo` mapeando para `ACTIVE`/`INACTIVE` via hook.
  - `Observações` (`notes`) — `textarea`.

## Validações (cliente)
- Obrigatórios marcados com `required` e indicação visual.
- Regras:
  - Email: regex padrão.
  - CPF/CNPJ: usar util `src/lib/doc-validation.js` (`digitsOnly`, `inferDocType`) para validar comprimento; aplicar máscara no `onChange`.
  - Exclusividade documento: permitir apenas um entre CPF e CNPJ; se CPF preenchido, desabilitar CNPJ e vice-versa.
  - Telefone e CEP: validar apenas por comprimento pós-máscara (apenas dígitos).
- Bloquear submit até todos obrigatórios válidos; exibir mensagens de erro inline.

## Integração com API
- Payload enviado via `use-clients` já mapeia snake_case → camelCase para API:
  - Enviar `cpf` ou `cnpj` (exatamente um), `email`, `name` obrigatórios.
  - Campos adicionais: `phone`, `address`, `notes`, `data_nascimento`, `codigo_acesso`, `senha_gov`, `codigo_regularize`, `senha_nfse`, `status`.
- O endpoint já valida exclusividade e formato; o formulário antecipa e evita erros.

## UX/Responsividade
- Grid responsivo 1–2 colunas conforme largura.
- Asterisco para obrigatórios; tooltips/helps curtos quando útil.
- Botão desabilitado enquanto inválido; feedback com `useToastContext` em sucesso/erro.

## Implementação
1. Refatorar `src/components/client-form.tsx` para controlar estados dos novos campos e aplicar máscaras no `onChange`.
2. Adicionar validações locais usando util `doc-validation` e regex simples (email/telefone/CEP).
3. Implementar lógica de exclusividade CPF/CNPJ (disabling e checagem na submissão).
4. Montar `CreateClientData` com todos os campos e chamar `createClient` do hook.
5. Atualizar o modal de edição (reusar `ClientForm` com `initialValues` quando presente).

## Verificação
- Testar submissão válida com CPF (PF) e com CNPJ (PJ) separadamente.
- Testar bloqueio quando ambos CPF e CNPJ preenchidos.
- Testar máscaras e validações (email, telefone, CEP).
- Confirmar visual responsivo e consistente.

## Testes
- Ampliar testes unitários do util de documentos (já criado) se necessário.
- Opcional: testes de integração do formulário com Jest + React Testing Library (se o projeto já usar; caso contrário, validar manualmente).

## Entregáveis
- Código do formulário atualizado.
- Validações e máscaras aplicadas.
- Funcionamento confirmado com API atual.

Confirma para eu aplicar as alterações no `ClientForm` e modal de novo cliente.