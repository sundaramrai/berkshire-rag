# Berkshire Hathaway Intelligence

A clean, modular RAG application built for the Pazago Mastra assignment. It answers questions about Warren Buffett's investment philosophy using Berkshire Hathaway shareholder letters from 1977 through 2024.

## Tech Stack

- Next.js 16 with App Router
- TypeScript
- Mastra 1.35
- Ollama Cloud `gpt-oss:20b-cloud` for response generation
- Mistral `mistral-embed` for embeddings
- PostgreSQL + `pgvector` for vector search and Mastra memory persistence
- AI SDK v6 for streaming chat UX
- `pdf-parse@1.1.4` for PDF text extraction

## Features

- Mastra agent with grounded Berkshire-specific instructions
- pgvector-backed retrieval with metadata filtering
- `MDocument` chunking pipeline for PDF ingestion
- Persistent thread memory via Mastra `Memory`
- Streaming chat UI with clickable source links
- GitHub Flavored Markdown rendering for tables, links, lists, and code blocks
- Re-runnable ingestion that replaces chunks per source file
- Docker-based local PostgreSQL setup

## Project Structure

```text
src/
+-- app/
|   +-- api/chat/route.ts
|   +-- globals.css
|   +-- layout.tsx
|   +-- page.tsx
+-- components/
|   +-- berkshire-chat.tsx
|   +-- chat-message.tsx
+-- documents/
|   +-- .gitkeep
+-- lib/
|   +-- env.ts
|   +-- chat-storage.ts
|   +-- mistral-provider.ts
|   +-- ollama-provider.ts
|   +-- berkshire/
|       +-- config.ts
|       +-- ingest.ts
|       +-- pdf.ts
|       +-- source-links.ts
|       +-- types.ts
|       +-- vector-store.ts
+-- mastra/
|   +-- agents/berkshire-agent.ts
|   +-- tools/berkshire-search-tool.ts
|   +-- workflows/ingest-shareholder-letters-workflow.ts
|   +-- prompts.ts
|   +-- index.ts
+-- scripts/
    +-- create-index.ts
    +-- ingest.ts
```

## Setup

1. Install dependencies:

```bash
npm install
```

1. Copy environment variables:

```bash
copy .env.example .env
```

1. Install Ollama, sign in, and pull the chat model:

```bash
ollama signin
ollama pull gpt-oss:20b-cloud
```

1. Confirm `.env` points to Ollama:

```env
OLLAMA_BASE_URL=http://localhost:11434/v1
OLLAMA_API_KEY=ollama
OLLAMA_CHAT_MODEL=gpt-oss:20b-cloud
MISTRAL_BASE_URL=https://api.mistral.ai/v1
MISTRAL_API_KEY=your-mistral-api-key
MISTRAL_EMBEDDING_MODEL=mistral-embed
MISTRAL_EMBEDDING_DIMENSION=1024
RAG_INGEST_BATCH_SIZE=8
POSTGRES_CONNECTION_STRING=postgresql://postgres:postgres@localhost:5432/berkshire
```

1. Start PostgreSQL with pgvector:

```bash
npm run db:up
```

1. Download the Berkshire Hathaway shareholder letters for 1977 through 2024.

2. Place those PDFs in `src/documents/`.
   Recommended filenames:

```text
1977.pdf
1978.pdf
...
2024.pdf
```

1. Create the vector index:

```bash
npm run rag:create-index
```

If you previously created the index with a different embedding model, recreate it:

```bash
npm run rag:recreate-index
```

1. Ingest the letters:

```bash
npm run rag:ingest
```

Ingestion can take 45-60 minutes locally with `RAG_INGEST_BATCH_SIZE=8`. It is a one-time setup step unless the index, database volume, documents, or embedding model changes.

## Run the App

Terminal 1:

```bash
npm run dev:studio
```

Mastra Studio runs at `http://localhost:4111`.

Deployed Mastra Studio:

- Agents: <https://berkshire-rag-assignment.studio.mastra.cloud/agents>
- Berkshire agent chat: <https://berkshire-rag-assignment.studio.mastra.cloud/agents/berkshire-intelligence-agent/chat/new>

Terminal 2:

```bash
npm run dev
```

The Next.js chat app runs at `http://localhost:3000`.

## Production Build

Run the production build locally before deployment:

```bash
npm run typecheck
npm run lint
npm run build
npm run start
```

The production app runs at `http://localhost:3000` by default.

## Deployment

This app depends on four runtime services:

- A Node.js host for the Next.js app
- A PostgreSQL database with `pgvector`
- An Ollama-compatible model endpoint for chat
- Mistral embeddings API access

### Option 1: VPS Deployment

This is the simplest production path for the current architecture because it can run Next.js, PostgreSQL, and Ollama from one server while Mistral remains a hosted API dependency.

1. Provision a Linux server.
2. Install Node.js, Docker, and Ollama.
3. Clone the repository.
4. Create `.env` with production values.
5. Start PostgreSQL:

```bash
npm run db:up
```

1. Sign in to Ollama and pull the chat model:

```bash
ollama signin
ollama pull gpt-oss:20b-cloud
```

1. Build the index and ingest documents once:

```bash
npm run rag:recreate-index
npm run rag:ingest
```

1. Build and start the app:

```bash
npm run build
npm run start
```

For a real production server, run the app under a process manager such as `pm2` or a systemd service, and put Nginx or Caddy in front for HTTPS.

### Option 2: Vercel Deployment

Vercel can host the Next.js app, but the current local-only dependencies must be moved to managed services:

- Replace local Docker PostgreSQL with a hosted PostgreSQL database that supports `pgvector`, such as Neon, Supabase, or a managed Postgres instance.
- Set `POSTGRES_CONNECTION_STRING` in Vercel project environment variables.
- Do not use `OLLAMA_BASE_URL=http://localhost:11434/v1` on Vercel. `localhost` would point to the Vercel function, not your development machine.
- Use a public Ollama-compatible endpoint for chat. For direct Ollama Cloud API access, create an Ollama API key and use a remote host instead of local Ollama.
- Use Mistral for embeddings so both ingestion and runtime retrieval can run from Vercel.
- Ingest the documents from a machine that can reach the hosted Postgres database. Do not run long ingestion as part of the Vercel build.

Production environment variables:

```env
OLLAMA_BASE_URL=https://your-ollama-compatible-host/v1
OLLAMA_API_KEY=your-production-key
OLLAMA_CHAT_MODEL=your-chat-model
MISTRAL_BASE_URL=https://api.mistral.ai/v1
MISTRAL_API_KEY=your-mistral-api-key
MISTRAL_EMBEDDING_MODEL=mistral-embed
MISTRAL_EMBEDDING_DIMENSION=1024
RAG_INGEST_BATCH_SIZE=8
POSTGRES_CONNECTION_STRING=postgresql://...
```

Deploy with the Vercel CLI:

```bash
npm i -g vercel
vercel
vercel --prod
```

Or connect the GitHub repository to Vercel and configure the same environment variables in the Vercel dashboard.

Mastra memory is stored in PostgreSQL, so the same hosted database persists both vectors and conversation state in production.

## Testing Checklist

Use these prompts in both Mastra Studio and the frontend:

- `What is Warren Buffett's investment philosophy?`
- `Can you elaborate on Buffett's views about diversification?`
- `How has Berkshire's acquisition strategy evolved over time?`
- `What companies did Berkshire acquire in 2023?`
- `What does Buffett say about market volatility and timing?`

Verify that:

- answers cite the relevant year
- the agent uses earlier context for follow-up questions
- clickable source chips appear in the frontend
- retrieval remains grounded in the letters

## Notes on Design Choices

- `createVectorQueryTool()` is used instead of a custom retrieval tool to stay aligned with Mastra's RAG patterns.
- `Memory` is configured for recent-message continuity, while PostgreSQL stores both thread state and the vector knowledge base.
- The ingestion path deletes old chunks per source before upserting, so rerunning the script is safe.
- Ingestion writes vectors in small batches to avoid long PostgreSQL transactions during local setup.
- The UI stores the current thread locally so the same Mastra memory thread continues across refreshes.
- Assistant responses are rendered with `react-markdown` and `remark-gfm` so model output can use standard Markdown plus GitHub Flavored Markdown tables.

## Known Requirements Before It Will Run End-to-End

- Ollama must be installed and signed in for the local cloud-model workflow.
- `gpt-oss:20b-cloud` must be available through Ollama.
- `MISTRAL_API_KEY` must be configured for document and query embeddings.
- PostgreSQL must be running on the connection string in `.env`.
- The Berkshire PDFs from 1977 through 2024 must exist in `src/documents/` before ingestion.

## Useful Commands

```bash
npm run lint
npm run typecheck
npm run build
npm run rag:create-index
npm run rag:recreate-index
npm run rag:ingest
npm run dev
npm run dev:studio
```

## References

- Mastra Next.js guide: <https://mastra.ai/guides/getting-started/next-js>
- Mastra vector databases: <https://mastra.ai/docs/rag/vector-databases>
- Mastra vector query tool: <https://mastra.ai/en/reference/tools/vector-query-tool>
- Mastra `Agent.stream()` reference: <https://mastra.ai/reference/streaming/agents/stream>
- Ollama Cloud: <https://docs.ollama.com/cloud>
- Ollama OpenAI compatibility: <https://docs.ollama.com/api/openai-compatibility>
- Mistral text embeddings: <https://docs.mistral.ai/capabilities/embeddings/text_embeddings>
- Vercel environment variables: <https://vercel.com/docs/environment-variables>
- Next.js production commands: <https://nextjs.org/docs/app/getting-started/installation>
