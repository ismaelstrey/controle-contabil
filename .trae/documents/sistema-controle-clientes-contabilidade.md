# Sistema de Controle de Clientes de Contabilidade - Documentação Técnica

## 1. Visão Geral do Sistema e Arquitetura

O sistema de controle de clientes de contabilidade é uma aplicação web full-stack desenvolvida para gerenciar informações de clientes de escritórios de contabilidade. A arquitetura segue o padrão MVC moderno com separação clara entre frontend, backend e camada de dados.

### Objetivos do Sistema
- Gerenciar cadastro completo de clientes (empresas e pessoas físicas)
- Controlar informações fiscais e contábeis
- Permitir importação/exportação de dados em massa
- Garantir segurança e controle de acesso
- Fornecer interface intuitiva e responsiva

### Arquitetura do Sistema

```mermaid
graph TD
    A[Cliente/Navegador] --> B[Next.js Frontend]
    B --> C[NextAuth.js]
    C --> D[API Routes]
    D --> E[Prisma ORM]
    E --> F[PostgreSQL]
    
    subgraph "Camada de Apresentação"
        B
    end
    
    subgraph "Camada de Segurança"
        C
    end
    
    subgraph "Camada de Aplicação"
        D
    end
    
    subgraph "Camada de Dados"
        E
        F
    end
```

## 2. Tecnologias Utilizadas

### Stack Principal
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **UI Components**: Shadcn/UI, Radix UI
- **Autenticação**: NextAuth.js v5 (Auth.js)
- **ORM**: Prisma 5.x
- **Banco de Dados**: PostgreSQL 15+
- **Validação**: Zod
- **Planilhas**: SheetJS (xlsx)
- **Exportação**: PapaParse (CSV)

### Ferramentas de Desenvolvimento
- **Build**: Vite/Next.js Build System
- **Linting**: ESLint, Prettier
- **Type Checking**: TypeScript 5.x
- **Containerização**: Docker, Docker Compose
- **Versionamento**: Git, Conventional Commits

## 3. Estrutura do Banco de Dados

### Schema Prisma Detalhado

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Modelos de Autenticação
model Account {
  id                String  @id @default(cuid())
  userId            String  @map("user_id")
  type              String
  provider          String
  providerAccountId String  @map("provider_account_id")
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique @map("session_token")
  userId       String   @map("user_id")
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime? @map("email_verified")
  image         String?
  password      String?
  role          Role      @default(USER)
  isActive      Boolean   @default(true) @map("is_active")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  accounts              Account[]
  sessions              Session[]
  createdClients        Client[]  @relation("CreatedBy")
  updatedClients        Client[]  @relation("UpdatedBy")
  importHistory        ImportHistory[]

  @@map("users")
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  @@map("verificationtokens")
}

// Modelos de Negócio
model Client {
  id                    String           @id @default(cuid())
  companyName           String?          @map("company_name") @db.VarChar(255)
  tradeName             String?          @map("trade_name") @db.VarChar(255)
  document              String           @unique @db.VarChar(20)
  documentType          DocumentType     @map("document_type")
  stateRegistration    String?          @map("state_registration") @db.VarChar(50)
  municipalRegistration String?          @map("municipal_registration") @db.VarChar(50)
  email                 String?          @db.VarChar(255)
  phone                 String?          @db.VarChar(20)
  cellphone             String?          @map("cellphone") @db.VarChar(20)
  website               String?          @db.VarChar(255)
  
  // Endereço
  postalCode           String?          @map("postal_code") @db.VarChar(10)
  address              String?          @db.VarChar(255)
  number               String?          @db.VarChar(20)
  complement           String?          @db.VarChar(255)
  neighborhood         String?          @db.VarChar(100)
  city                 String?          @db.VarChar(100)
  state                String?          @db.VarChar(2)
  country              String?          @default("Brasil") @db.VarChar(100)
  
  // Informações Contábeis
  accountingType       AccountingType   @map("accounting_type")
  taxRegime            TaxRegime        @map("tax_regime")
  cnae                 String?          @db.VarChar(10)
  cnaeDescription      String?          @map("cnae_description") @db.Text
  openingDate          DateTime?        @map("opening_date")
  legalNature          String?          @map("legal_nature") @db.VarChar(100)
  
  // Informações Complementares
  revenue              Decimal?         @db.Decimal(15, 2)
  employees            Int?
  status               ClientStatus     @default(ACTIVE)
  observations         String?          @db.Text
  
  // Controle
  createdAt            DateTime         @default(now()) @map("created_at")
  updatedAt            DateTime         @updatedAt @map("updated_at")
  createdBy            String           @map("created_by")
  updatedBy            String           @map("updated_by")
  
  // Relacionamentos
  partners             Partner[]
  contacts             Contact[]
  documents            ClientDocument[]
  creator              User             @relation("CreatedBy", fields: [createdBy], references: [id])
  updater              User             @relation("UpdatedBy", fields: [updatedBy], references: [id])
  
  @@index([document])
  @@index([companyName])
  @@index([status])
  @@map("clients")
}

model Partner {
  id          String   @id @default(cuid())
  clientId    String   @map("client_id")
  name        String   @db.VarChar(255)
  document    String   @db.VarChar(20)
  email       String?  @db.VarChar(255)
  phone       String?  @db.VarChar(20)
  participation Decimal? @db.Decimal(5, 2)
  isActive    Boolean  @default(true) @map("is_active")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  
  client Client @relation(fields: [clientId], references: [id], onDelete: Cascade)
  
  @@index([clientId])
  @@map("partners")
}

model Contact {
  id        String   @id @default(cuid())
  clientId  String   @map("client_id")
  name      String   @db.VarChar(255)
  email     String?  @db.VarChar(255)
  phone     String?  @db.VarChar(20)
  cellphone String?  @map("cellphone") @db.VarChar(20)
  role      String?  @db.VarChar(100)
  isActive  Boolean  @default(true) @map("is_active")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  
  client Client @relation(fields: [clientId], references: [id], onDelete: Cascade)
  
  @@index([clientId])
  @@map("contacts")
}

model ClientDocument {
  id          String      @id @default(cuid())
  clientId    String      @map("client_id")
  name        String      @db.VarChar(255)
  description String?     @db.Text
  fileName    String      @map("file_name") @db.VarChar(255)
  fileSize    Int         @map("file_size")
  fileType    String      @map("file_type") @db.VarChar(100)
  fileUrl     String      @map("file_url") @db.Text
  category    String      @db.VarChar(100)
  uploadedAt  DateTime    @default(now()) @map("uploaded_at")
  
  client Client @relation(fields: [clientId], references: [id], onDelete: Cascade)
  
  @@index([clientId])
  @@index([category])
  @@map("client_documents")
}

model ImportHistory {
  id          String      @id @default(cuid())
  userId      String      @map("user_id")
  fileName    String      @map("file_name") @db.VarChar(255)
  fileSize    Int         @map("file_size")
  status      ImportStatus @default(PROCESSING)
  totalRows   Int?        @map("total_rows")
  successRows Int?        @map("success_rows")
  errorRows   Int?        @map("error_rows")
  errors      String?     @db.Text
  createdAt   DateTime    @default(now()) @map("created_at")
  completedAt DateTime?   @map("completed_at")
  
  user User @relation(fields: [userId], references: [id])
  
  @@index([userId])
  @@index([status])
  @@map("import_history")
}

// Enums
enum Role {
  USER
  ADMIN
}

enum DocumentType {
  CPF
  CNPJ
}

enum AccountingType {
  MEI
  SIMPLES_NACIONAL
  LUCRO_PRESUMIDO
  LUCRO_REAL
  SEBRAE
  COOPERATIVA
  MICRO_EMPRESA_INDIVIDUAL
}

enum TaxRegime {
  SIMPLES_NACIONAL
  LUCRO_PRESUMIDO
  LUCRO_REAL
  LUCRO_ARBITRADO
  IMUNE
  ISENTA
}

enum ClientStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
}

enum ImportStatus {
  PROCESSING
  COMPLETED
  FAILED
}
```

## 4. Estrutura de Pastas do Projeto

```
contabil-client-system/
├── app/                          # Next.js App Router
│   ├── (auth)/                  # Rotas de autenticação
│   │   ├── login/               # Página de login
│   │   └── register/            # Página de registro
│   ├── (dashboard)/             # Dashboard principal
│   │   ├── clients/             # Gestão de clientes
│   │   │   ├── page.tsx         # Listagem de clientes
│   │   │   ├── [id]/            # Detalhes do cliente
│   │   │   ├── new/             # Novo cliente
│   │   │   └── edit/[id]/       # Editar cliente
│   │   ├── imports/             # Importação de dados
│   │   ├── reports/             # Relatórios
│   │   └── settings/            # Configurações
│   ├── api/                     # API Routes
│   │   ├── auth/[...nextauth]/  # NextAuth.js
│   │   ├── clients/             # CRUD de clientes
│   │   ├── imports/             # Importação Excel
│   │   ├── exports/             # Exportação CSV
│   │   └── documents/           # Gestão de documentos
│   ├── layout.tsx               # Layout principal
│   └── globals.css              # Estilos globais
├── components/                    # Componentes React
│   ├── ui/                      # Componentes UI (Shadcn)
│   ├── clients/                 # Componentes de clientes
│   ├── forms/                   # Formulários reutilizáveis
│   ├── tables/                  # Tabelas e data grids
│   └── shared/                  # Componentes compartilhados
├── lib/                          # Utilitários e configurações
│   ├── auth.ts                  # Configuração NextAuth
│   ├── prisma.ts                # Cliente Prisma
│   ├── utils.ts                 # Funções utilitárias
│   └── validations.ts           # Schemas Zod
├── hooks/                        # React Hooks customizados
├── types/                        # Definições TypeScript
├── prisma/                       # Schema e migrações
│   ├── schema.prisma
│   └── migrations/
├── public/                       # Assets estáticos
├── docker/                       # Configurações Docker
│   ├── Dockerfile
│   └── docker-compose.yml
└── tests/                        # Testes unitários e integração
```

## 5. Componentes Reutilizáveis

### 5.1 Componentes de Formulário

```typescript
// components/forms/client-form.tsx
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

const clientFormSchema = z.object({
  companyName: z.string().min(3, "Nome da empresa é obrigatório"),
  document: z.string().regex(/^\d{14}$|^\d{11}$/, "Documento inválido"),
  email: z.string().email("Email inválido").optional(),
  // ... outros campos
})

export function ClientForm({ client, onSubmit }: ClientFormProps) {
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: client || defaultValues,
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Campos do formulário */}
      </form>
    </Form>
  )
}
```

### 5.2 Componentes de Tabela

```typescript
// components/tables/clients-table.tsx
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"

export function ClientsTable({ data, onEdit, onDelete }: ClientsTableProps) {
  const columns: ColumnDef<Client>[] = [
    {
      accessorKey: "companyName",
      header: "Razão Social",
    },
    {
      accessorKey: "document",
      header: "CNPJ/CPF",
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => onEdit(row.original)}>
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(row.original)}>
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <Table>
      {/* Renderização da tabela */}
    </Table>
  )
}
```

### 5.3 Componentes de Upload

```typescript
// components/ui/file-upload.tsx
import { useDropzone } from "react-dropzone"

export function FileUpload({ onFileAccepted, accept, maxSize }: FileUploadProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept,
    maxSize,
    onDrop: (files) => onFileAccepted(files[0]),
  })

  return (
    <div {...getRootProps()} className="border-2 border-dashed rounded-lg p-6">
      <input {...getInputProps()} />
      {isDragActive ? (
        <p>Solte o arquivo aqui...</p>
      ) : (
        <p>Arraste e solte o arquivo ou clique para selecionar</p>
      )}
    </div>
  )
}
```

## 6. API Routes e Endpoints REST

### 6.1 Clientes

```typescript
// app/api/clients/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { clientSchema } from "@/lib/validations"

// GET /api/clients - Listar clientes com paginação
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "10")
  const search = searchParams.get("search") || ""

  const skip = (page - 1) * limit

  const where = search ? {
    OR: [
      { companyName: { contains: search, mode: "insensitive" } },
      { document: { contains: search, mode: "insensitive" } },
    ],
  } : {}

  const [clients, total] = await Promise.all([
    prisma.client.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        partners: true,
        contacts: true,
        _count: {
          select: {
            partners: true,
            contacts: true,
            documents: true,
          },
        },
      },
    }),
    prisma.client.count({ where }),
  ])

  return NextResponse.json({
    data: clients,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  })
}

// POST /api/clients - Criar novo cliente
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const validatedData = clientSchema.parse(body)

    const client = await prisma.client.create({
      data: {
        ...validatedData,
        createdBy: session.user.id,
        updatedBy: session.user.id,
      },
      include: {
        partners: true,
        contacts: true,
      },
    })

    return NextResponse.json(client, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: "Erro ao criar cliente" }, { status: 500 })
  }
}
```

### 6.2 Importação Excel

```typescript
// app/api/clients/import/route.ts
import { NextRequest, NextResponse } from "next/server"
import * as XLSX from "xlsx"
import { z } from "zod"

const importRowSchema = z.object({
  companyName: z.string().min(1, "Razão Social obrigatória"),
  document: z.string().regex(/^\d{14}$|^\d{11}$/, "CNPJ/CPF inválido"),
  email: z.string().email("Email inválido").optional(),
  phone: z.string().optional(),
  accountingType: z.enum(["MEI", "SIMPLES_NACIONAL", "LUCRO_PRESUMIDO", "LUCRO_REAL"]),
  taxRegime: z.enum(["SIMPLES_NACIONAL", "LUCRO_PRESUMIDO", "LUCRO_REAL"]),
})

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "Arquivo não fornecido" }, { status: 400 })
    }

    // Ler arquivo Excel
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer)
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    const data = XLSX.utils.sheet_to_json(worksheet)

    // Criar histórico de importação
    const importHistory = await prisma.importHistory.create({
      data: {
        userId: session.user.id,
        fileName: file.name,
        fileSize: file.size,
        totalRows: data.length,
        status: "PROCESSING",
      },
    })

    // Processar dados
    const results = await processImportData(data, session.user.id)

    // Atualizar histórico
    await prisma.importHistory.update({
      where: { id: importHistory.id },
      data: {
        status: "COMPLETED",
        successRows: results.successCount,
        errorRows: results.errorCount,
        errors: JSON.stringify(results.errors),
        completedAt: new Date(),
      },
    })

    return NextResponse.json({
      message: "Importação concluída",
      successCount: results.successCount,
      errorCount: results.errorCount,
      errors: results.errors,
    })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao processar arquivo" }, { status: 500 })
  }
}

async function processImportData(data: any[], userId: string) {
  const results = { successCount: 0, errorCount: 0, errors: [] as string[] }

  for (let i = 0; i < data.length; i++) {
    try {
      const row = importRowSchema.parse(data[i])
      
      await prisma.client.create({
        data: {
          ...row,
          createdBy: userId,
          updatedBy: userId,
        },
      })
      
      results.successCount++
    } catch (error) {
      results.errorCount++
      results.errors.push(`Linha ${i + 1}: ${error.message}`)
    }
  }

  return results
}
```

### 6.3 Exportação CSV

```typescript
// app/api/clients/export/route.ts
import { NextRequest, NextResponse } from "next/server"
import Papa from "papaparse"

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  try {
    const clients = await prisma.client.findMany({
      where: { status: "ACTIVE" },
      include: {
        partners: true,
        contacts: true,
      },
      orderBy: { companyName: "asc" },
    })

    // Transformar dados para CSV
    const csvData = clients.map(client => ({
      "Razão Social": client.companyName,
      "Nome Fantasia": client.tradeName,
      "CNPJ/CPF": client.document,
      "Email": client.email,
      "Telefone": client.phone,
      "Celular": client.cellphone,
      "Tipo Contábil": client.accountingType,
      "Regime Tributário": client.taxRegime,
      "CNAE": client.cnae,
      "Data Abertura": client.openingDate?.toISOString().split('T')[0],
      "Status": client.status,
    }))

    const csv = Papa.unparse(csvData)

    // Configurar headers para download
    const headers = new Headers()
    headers.set("Content-Type", "text/csv")
    headers.set("Content-Disposition", `attachment; filename="clientes_${new Date().toISOString().split('T')[0]}.csv"`)

    return new NextResponse(csv, { headers })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao exportar dados" }, { status: 500 })
  }
}
```

## 7. Sistema de Autenticação e Segurança

### 7.1 Configuração NextAuth.js

```typescript
// lib/auth.ts
import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
}
```

### 7.2 Middleware de Autorização

```typescript
// middleware.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const isAuthPage = request.nextUrl.pathname.startsWith("/login")
  
  if (isAuthPage) {
    if (token) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
    return null
  }

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Verificar permissões de admin
  const isAdminPage = request.nextUrl.pathname.startsWith("/admin")
  if (isAdminPage && token.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return null
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
```

### 7.3 Rate Limiting e Segurança

```typescript
// lib/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
  analytics: true,
})

export async function rateLimitMiddleware(
  request: Request,
  handler: () => Promise<Response>
) {
  const ip = request.headers.get("x-forwarded-for") ?? "anonymous"
  const { success, limit, reset, remaining } = await ratelimit.limit(ip)

  if (!success) {
    return new Response("Too Many Requests", {
      status: 429,
      headers: {
        "X-RateLimit-Limit": limit.toString(),
        "X-RateLimit-Remaining": remaining.toString(),
        "X-RateLimit-Reset": reset.toString(),
      },
    })
  }

  const response = await handler()
  response.headers.set("X-RateLimit-Limit", limit.toString())
  response.headers.set("X-RateLimit-Remaining", remaining.toString())
  response.headers.set("X-RateLimit-Reset", reset.toString())

  return response
}
```

## 8. Funcionalidades Principais

### 8.1 CRUD de Clientes

```typescript
// app/(dashboard)/clients/page.tsx
import { ClientsTable } from "@/components/tables/clients-table"
import { ClientForm } from "@/components/forms/client-form"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function ClientsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const { data: clients, isLoading, refetch } = useClients()

  const handleCreate = async (data: ClientFormData) => {
    try {
      await createClient(data)
      toast.success("Cliente criado com sucesso")
      setIsCreateModalOpen(false)
      refetch()
    } catch (error) {
      toast.error("Erro ao criar cliente")
    }
  }

  const handleEdit = async (data: ClientFormData) => {
    if (!selectedClient) return
    
    try {
      await updateClient(selectedClient.id, data)
      toast.success("Cliente atualizado com sucesso")
      setIsEditModalOpen(false)
      refetch()
    } catch (error) {
      toast.error("Erro ao atualizar cliente")
    }
  }

  const handleDelete = async (client: Client) => {
    if (!confirm(`Deseja realmente excluir ${client.companyName}?`)) return

    try {
      await deleteClient(client.id)
      toast.success("Cliente excluído com sucesso")
      refetch()
    } catch (error) {
      toast.error("Erro ao excluir cliente")
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Clientes</h1>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          Novo Cliente
        </Button>
      </div>

      <ClientsTable
        data={clients?.data || []}
        isLoading={isLoading}
        onEdit={(client) => {
          setSelectedClient(client)
          setIsEditModalOpen(true)
        }}
        onDelete={handleDelete}
      />

      {/* Modal de criação */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Cliente</DialogTitle>
          </DialogHeader>
          <ClientForm onSubmit={handleCreate} />
        </DialogContent>
      </Dialog>

      {/* Modal de edição */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
          </DialogHeader>
          <ClientForm client={selectedClient} onSubmit={handleEdit} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
```

### 8.2 Importação Excel

```typescript
// app/(dashboard)/imports/page.tsx
import { FileUpload } from "@/components/ui/file-upload"
import { ImportHistoryTable } from "@/components/tables/import-history-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ImportsPage() {
  const { data: importHistory, refetch } = useImportHistory()

  const handleFileUpload = async (file: File) => {
    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch("/api/clients/import", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Erro ao importar arquivo")
      }

      const result = await response.json()
      toast.success(`Importação concluída: ${result.successCount} sucessos, ${result.errorCount} erros`)
      refetch()
    } catch (error) {
      toast.error("Erro ao importar arquivo")
    }
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Importação de Clientes</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Upload de Arquivo Excel</CardTitle>
          </CardHeader>
          <CardContent>
            <FileUpload
              accept={{
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
                "application/vnd.ms-excel": [".xls"],
              }}
              maxSize={10 * 1024 * 1024} // 10MB
              onFileAccepted={handleFileUpload}
            />
            <div className="mt-4 text-sm text-gray-600">
              <p>Formato esperado:</p>
              <ul className="list-disc list-inside mt-2">
                <li>Razão Social (obrigatório)</li>
                <li>CNPJ/CPF (obrigatório)</li>
                <li>Email</li>
                <li>Telefone</li>
                <li>Tipo Contábil</li>
                <li>Regime Tributário</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Histórico de Importações</CardTitle>
          </CardHeader>
          <CardContent>
            <ImportHistoryTable data={importHistory || []} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

### 8.3 Exportação CSV

```typescript
// components/ui/export-button.tsx
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

export function ExportButton({ variant = "outline" }: ExportButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleExport = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/clients/export")
      
      if (!response.ok) {
        throw new Error("Erro ao exportar dados")
      }

      // Criar blob e fazer download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `clientes_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success("Dados exportados com sucesso")
    } catch (error) {
      toast.error("Erro ao exportar dados")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleExport} disabled={isLoading} variant={variant}>
      <Download className="mr-2 h-4 w-4" />
      {isLoading ? "Exportando..." : "Exportar CSV"}
    </Button>
  )
}
```

## 9. Configuração Docker e Ambiente de Desenvolvimento

### 9.1 Dockerfile

```dockerfile
# docker/Dockerfile
FROM node:18-alpine AS base

# Instalar dependências do sistema
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependências
RUN npm ci --only=production

# Gerar cliente Prisma
RUN npx prisma generate

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build

# Expor porta
EXPOSE 3000

# Comando para iniciar
CMD ["npm", "start"]
```

### 9.2 Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: contabil-postgres
    environment:
      POSTGRES_DB: contabil_clientes
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres123
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - contabil-network

  redis:
    image: redis:7-alpine
    container_name: contabil-redis
    ports:
      - "6379:6379"
    networks:
      - contabil-network

  app:
    build:
      context: .
      dockerfile: docker/Dockerfile
    container_name: contabil-app
    environment:
      DATABASE_URL: postgresql://postgres:postgres123@postgres:5432/contabil_clientes
      NEXTAUTH_URL: http://localhost:3000
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
      REDIS_URL: redis://redis:6379
    ports:
      - "3000:3000"
    depends_on:
      - postgres
      - redis
    networks:
      - contabil-network
    volumes:
      - ./uploads:/app/uploads

volumes:
  postgres_data:

networks:
  contabil-network:
    driver: bridge
```

### 9.3 Variáveis de Ambiente

```bash
# .env.local
# Banco de Dados
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/contabil_clientes"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Redis (para rate limiting)
REDIS_URL="redis://localhost:6379"

# Upload de arquivos
MAX_FILE_SIZE="10485760" # 10MB
UPLOAD_DIR="./uploads"

# Segurança
JWT_SECRET="your-jwt-secret-here"
BCRYPT_ROUNDS="12"

# Email (opcional)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="noreply@yourdomain.com"
```

### 9.4 Scripts de Desenvolvimento

```json
// package.json
{
  "scripts": {
    "dev": "next dev",
    "build": "prisma generate && next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio",
    "prisma:seed": "tsx prisma/seed.ts",
    "docker:build": "docker-compose build",
    "docker:up": "docker-compose up -d",
    "docker:down": "docker-compose down",
    "docker:logs": "docker-compose logs -f",
    "setup": "npm install && npm run prisma:generate && npm run prisma:migrate && npm run prisma:seed"
  }
}
```

## 10. Deploy e Considerações de Produção

### 10.1 Configuração para Produção

```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['localhost'],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
```

### 10.2 Health Check e Monitoramento

```typescript
// app/api/health/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const checks = {
    database: false,
    timestamp: new Date().toISOString(),
  }

  try {
    await prisma.$queryRaw`SELECT 1`
    checks.database = true
  } catch (error) {
    console.error("Health check failed:", error)
  }

  const isHealthy = Object.values(checks).every(check => check === true || typeof check === 'string')
  
  return NextResponse.json(checks, { 
    status: isHealthy ? 200 : 503 
  })
}
```

### 10.3 Backup e Recuperação

```bash
#!/bin/bash
# scripts/backup-database.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_NAME="contabil_clientes"
DB_USER="postgres"

# Criar backup
pg_dump -U $DB_USER -d $DB_NAME -f "$BACKUP_DIR/backup_$DATE.sql"

# Comprimir backup
gzip "$BACKUP_DIR/backup_$DATE.sql"

# Remover backups antigos (manter últimos 7 dias)
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete

echo "Backup concluído: backup_$DATE.sql.gz"
```

### 10.4 Deploy com Vercel (exemplo)

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["gru1"],
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "env": {
    "DATABASE_URL": "@database_url",
    "NEXTAUTH_SECRET": "@nextauth_secret",
    "NEXTAUTH_URL": "@nextauth_url"
  }
}
```

### 10.5 Checklist de Produção

#### Segurança
- [ ] Configurar HTTPS obrigatório
- [ ] Atualizar todas as chaves secretas
- [ ] Configurar rate limiting apropriado
- [ ] Implementar CORS se necessário
- [ ] Configurar logs de auditoria
- [ ] Implementar backup automático

#### Performance
- [ ] Configurar cache com Redis
- [ ] Otimizar queries do banco de dados
- [ ] Implementar paginação em todas as listagens
- [ ] Configurar CDN para assets estáticos
- [ ] Implementar lazy loading para imagens

#### Monitoramento
- [ ] Configurar health checks
- [ ] Implementar error tracking (Sentry)
- [ ] Configurar alertas de performance
- [ ] Implementar analytics (opcional)
- [ ] Configurar logs centralizados

#### Backup e Recuperação
- [ ] Configurar backup automático do banco
- [ ] Testar procedimento de restore
- [ ] Documentar plano de recuperação
- [ ] Configurar replicação se necessário

### 10.6 Manutenção e Atualizações

```typescript
// scripts/migrate-and-deploy.ts
import { execSync } from "child_process"

async function deploy() {
  console.log("Iniciando deploy...")
  
  try {
    // 1. Backup do banco
    console.log("Criando backup do banco...")
    execSync("npm run db:backup", { stdio: "inherit" })
    
    // 2. Parar serviço
    console.log("Parando serviço...")
    execSync("pm2 stop contabil-app", { stdio: "inherit" })
    
    // 3. Atualizar código
    console.log("Atualizando código...")
    execSync("git pull origin main", { stdio: "inherit" })
    
    // 4. Instalar dependências
    console.log("Instalando dependências...")
    execSync("npm ci", { stdio: "inherit" })
    
    // 5. Rodar migrações
    console.log("Rodando migrações...")
    execSync("npx prisma migrate deploy", { stdio: "inherit" })
    
    // 6. Build
    console.log("Build da aplicação...")
    execSync("npm run build", { stdio: "inherit" })
    
    // 7. Iniciar serviço
    console.log("Iniciando serviço...")
    execSync("pm2 start contabil-app", { stdio: "inherit" })
    
    console.log("Deploy concluído com sucesso!")
  } catch (error) {
    console.error("Erro durante o deploy:", error)
    process.exit(1)
  }
}

deploy()
```

## Conclusão

Este documento técnico fornece uma base sólida para a implementação completa do sistema de controle de clientes de contabilidade. A arquitetura proposta é escalável, segura e mantém as melhores práticas de desenvolvimento moderno.

Os principais pontos de atenção para implementação são:

1. **Segurança**: Implementação completa de autenticação e autorização
2. **Performance**: Otimização de queries e implementação de cache
3. **Manutenibilidade**: Código limpo e bem documentado
4. **Escalabilidade**: Arquitetura preparada para crescimento
5. **Confiabilidade**: Sistema de backup e recuperação robusto

O sistema está pronto para ser implementado em produção com as devidas adaptações específicas do ambiente e requisitos do cliente