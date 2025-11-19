# 🎯 ContabilJaque - Guia de Acesso Admin

## ✅ Usuário Admin Criado com Sucesso!

### 📧 **Credenciais de Acesso**
- **Email:** `contabiljaque.admin@gmail.com`
- **Senha:** `admin123`
- **Função:** Administrador

### 🔗 **Acesso ao Sistema**
1. Abra o navegador e acesse: `http://localhost:3000`
2. Clique em "Fazer Login" ou acesse diretamente: `http://localhost:3000/login`
3. Use as credenciais acima
4. **Importante:** Altere a senha após o primeiro login!

### 📋 **Funcionalidades Disponíveis**

#### 🏢 **Gestão de Clientes**
- Cadastrar novos clientes (nome, CPF/CNPJ, telefone, endereço)
- Visualizar lista completa de clientes
- Editar informações dos clientes
- Buscar clientes por nome ou CPF/CNPJ

#### 💰 **Controle de Mensalidades**
- Registrar pagamentos mensais por cliente
- Marcar mensalidades como pagas/em aberto
- Visualizar histórico de pagamentos
- Gerar relatórios financeiros

#### 📊 **Serviços Anuais (IRPF)**
- Cadastrar serviços anuais (IRPF, balanço, etc.)
- Controlar status de entrega
- Gerenciar prazos e documentação

#### 📁 **Documentos**
- Fazer upload de documentos por cliente
- Organizar por categoria (contratos, NF, etc.)
- Download de arquivos

#### 📤 **Importação/Exportação**
- Importar clientes de planilhas Excel
- Exportar dados para CSV
- Migrar dados de outros sistemas

### 🔧 **Configurações Recomendadas**

#### **Alterar Senha Admin**
1. Faça login com as credenciais padrão
2. Vá para Configurações > Perfil
3. Altere a senha para uma mais segura

#### **Adicionar Novos Usuários**
- Apenas o admin pode criar novos usuários
- Cada usuário tem acesso apenas aos seus clientes
- Sistema multi-usuário com permissões

### 🛠️ **Comandos Úteis**

```bash
# Iniciar o servidor de desenvolvimento
npm run dev

# Criar novo usuário admin (se necessário)
npx tsx scripts/create-admin-direct.ts

# Testar login do admin
npx tsx scripts/test-admin-login.ts

# Acessar banco de dados via Prisma Studio
npm run db:studio
```

### 📞 **Suporte**

Se encontrar problemas:
1. Verifique se o servidor está rodando: `npm run dev`
2. Confirme as credenciais no arquivo `.env.local`
3. Teste o login com: `npx tsx scripts/test-admin-login.ts`
4. Reinicie o servidor se necessário

### ⚠️ **Importante**

- **Segurança:** Altere a senha admin imediatamente
- **Backup:** Faça backup regular dos dados
- **Privacidade:** Sistema protege dados sensíveis dos clientes
- **Atualizações:** Mantenha o sistema atualizado

---

**🎉 Sistema pronto para uso!**
Seu sistema de controle de clientes está completo e funcional.
Sua esposa pode começar a usar imediatamente para gerenciar os clientes de contabilidade.