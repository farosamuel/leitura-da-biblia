<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Plano de Leitura - Célula Raiz de Davi

Aplicação web para acompanhamento de plano de leitura bíblica com insights gerados por IA.

## 🚀 Deploy para Produção (Vercel)

### Pré-requisitos
- Conta no [Vercel](https://vercel.com)
- Conta no [Google AI Studio](https://makersuite.google.com/app/apikey) para obter a API Key do Gemini
- Node.js instalado localmente (para testar o build)

### Passo a Passo

#### 1. Preparar o Projeto

Certifique-se de que todas as dependências estão instaladas:
```bash
npm install
```

Teste o build localmente:
```bash
npm run build
```

Se o build for bem-sucedido, uma pasta `dist` será criada.

#### 2. Fazer Deploy no Vercel

**Opção A: Via Interface Web (Recomendado)**

1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em "Add New Project"
3. Importe seu repositório Git (GitHub, GitLab ou Bitbucket)
4. Configure o projeto:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (raiz do projeto)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. **Configure as Variáveis de Ambiente**:
   - `VITE_GEMINI_API_KEY`: Sua chave da API do Gemini
   - `VITE_SUPABASE_URL`: (Opcional) URL do seu projeto Supabase
   - `VITE_SUPABASE_ANON_KEY`: (Opcional) Chave anônima do Supabase

6. Clique em "Deploy"

**Opção B: Via CLI**

1. Instale a CLI do Vercel:
```bash
npm i -g vercel
```

2. No diretório do projeto, execute:
```bash
vercel
```

3. Siga as instruções no terminal para fazer login e configurar o projeto

4. Configure as variáveis de ambiente:
```bash
vercel env add VITE_GEMINI_API_KEY
vercel env add VITE_SUPABASE_URL  # opcional
vercel env add VITE_SUPABASE_ANON_KEY  # opcional
```

5. Faça o deploy para produção:
```bash
vercel --prod
```

#### 3. Configurar Variáveis de Ambiente

No painel do Vercel:
1. Vá em **Settings** → **Environment Variables**
2. Adicione as seguintes variáveis:

| Variável | Descrição | Obrigatória |
|----------|-----------|-------------|
| `VITE_GEMINI_API_KEY` | Chave da API do Google Gemini | ✅ Sim |
| `VITE_SUPABASE_URL` | URL do projeto Supabase | ❌ Não (tem valor padrão) |
| `VITE_SUPABASE_ANON_KEY` | Chave anônima do Supabase | ❌ Não (tem valor padrão) |

**⚠️ Importante**: Após adicionar variáveis de ambiente, você precisa fazer um novo deploy para que as alterações tenham efeito.

#### 4. Verificar o Deploy

Após o deploy, o Vercel fornecerá uma URL como:
- `https://seu-projeto.vercel.app`

Acesse a URL e teste todas as funcionalidades.

#### 5. Configurar Domínio Customizado (Opcional)

1. No painel do Vercel, vá em **Settings** → **Domains**
2. Adicione seu domínio
3. Siga as instruções para configurar os registros DNS

## 💻 Desenvolvimento Local

### Pré-requisitos
- Node.js (versão 18 ou superior)

### Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd leitura-biblia
```

2. Instale as dependências:
```bash
npm install
```

3. Crie um arquivo `.env.local` na raiz do projeto:
```env
VITE_GEMINI_API_KEY=sua_chave_api_aqui
VITE_SUPABASE_URL=https://seu-projeto.supabase.co  # opcional
VITE_SUPABASE_ANON_KEY=sua_chave_anon_aqui  # opcional
```

4. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

5. Acesse `http://localhost:3000` no navegador

### Scripts Disponíveis

- `npm run dev`: Inicia o servidor de desenvolvimento
- `npm run build`: Cria a build de produção na pasta `dist`
- `npm run preview`: Pré-visualiza a build de produção localmente

## 🗄️ Banco de Dados (Supabase)

O projeto usa Supabase para autenticação e armazenamento. As migrações estão em `supabase/migrations/`.

Para configurar o Supabase:
1. Crie um projeto no [Supabase](https://supabase.com)
2. Execute as migrações na ordem:
   - `20260102_initial_schema.sql`
   - `20260102_fix_posts_schema.sql`
   - `20260102_multi_user_schema.sql`

3. Configure as variáveis de ambiente com as credenciais do seu projeto

## 📝 Notas Importantes

- As variáveis de ambiente com prefixo `VITE_` são expostas no frontend. Nunca coloque chaves secretas ou sensíveis nessas variáveis.
- O arquivo `vercel.json` já está configurado para SPA (Single Page Application) com rewrites adequados.
- Para produção, certifique-se de ter um plano adequado do Google Gemini API para suportar o uso esperado.

## 🔗 Links Úteis

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Documentation](https://vitejs.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [Google Gemini API](https://ai.google.dev/)
