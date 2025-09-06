# Maps Células

Este é um projeto Next.js que exibe um mapa interativo com informações sobre células religiosas, utilizando Google Maps e Supabase.

## Configuração

### 1. Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```env
# Google Maps API Key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=sua_chave_do_google_maps

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

### 2. Google Maps API

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative a API do Google Maps JavaScript
4. Crie uma chave de API
5. Configure as restrições de domínio conforme necessário

### 3. Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Vá para Settings > API
4. Copie a URL do projeto e a chave anônima
5. Crie uma tabela chamada `celulas` com as seguintes colunas:
   - `lat` (text)
   - `lng` (text)
   - `nome_lider` (text)
   - `nome_celula` (text)
   - `bairro` (text)
   - `rede` (text)
   - `discipulado` (text)
   - `publico_alvo` (text)
   - `dia_da_semana` (text)
   - `celular_lider` (text)
   - `horario` (text)
   - `photo` (text)

## Getting Started

Primeiro, instale as dependências:

```bash
npm install
```

Em seguida, execute o servidor de desenvolvimento:

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador para ver o resultado.

## Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria uma versão otimizada para produção
- `npm run start` - Inicia o servidor de produção
- `npm run lint` - Executa o linter ESLint

## Tecnologias Utilizadas

- Next.js 15
- React 19
- TypeScript
- Google Maps API
- Supabase
- Tailwind CSS
- Font Awesome
