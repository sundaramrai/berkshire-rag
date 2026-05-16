# Berkshire Hathaway Intelligence

A clean, modular RAG application built for the Pazago Mastra assignment. It answers questions about Warren Buffett's investment philosophy using Berkshire Hathaway shareholder letters from 1977 through 2024.

## Tech Stack

- Next.js 16 with App Router
- TypeScript
- Mastra 1.34
- Ollama Cloud `gpt-oss:20b-cloud` for response generation
- Ollama `embeddinggemma` for embeddings
- PostgreSQL + `pgvector` for vector search
- LibSQL/SQLite for Mastra memory persistence
- AI SDK v6 for streaming chat UX
- `pdf-parse@1.1.4` for PDF text extraction

## Features

- Mastra agent with grounded Berkshire-specific instructions
- pgvector-backed retrieval with metadata filtering
- `MDocument` chunking pipeline for PDF ingestion
- Persistent thread memory via Mastra `Memory`
- Streaming chat UI with source rendering
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
|   +-- ollama-provider.ts
|   +-- berkshire/
|       +-- config.ts
|       +-- ingest.ts
|       +-- pdf.ts
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

2. Copy environment variables:

```bash
copy .env.example .env
```

3. Install Ollama, sign in, and pull the required models:

```bash
ollama signin
ollama pull embeddinggemma
ollama pull gpt-oss:20b-cloud
```

4. Confirm `.env` points to Ollama:

```env
OLLAMA_BASE_URL=http://localhost:11434/v1
OLLAMA_API_KEY=ollama
OLLAMA_CHAT_MODEL=gpt-oss:20b-cloud
OLLAMA_EMBEDDING_MODEL=embeddinggemma
OLLAMA_EMBEDDING_DIMENSION=768
RAG_INGEST_BATCH_SIZE=8
POSTGRES_CONNECTION_STRING=postgresql://postgres:postgres@localhost:5432/berkshire
```

5. Start PostgreSQL with pgvector:

```bash
npm run db:up
```

6. Download the Berkshire Hathaway shareholder letters for 1977 through 2024.

7. Place those PDFs in `src/documents/`.
   Recommended filenames:

```text
1977.pdf
1978.pdf
...
2024.pdf
```

8. Create the vector index:

```bash
npm run rag:create-index
```

If you previously created the index with a different embedding model, recreate it:

```bash
npm run rag:recreate-index
```

9. Ingest the letters:

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

This app depends on three runtime services:

- A Node.js host for the Next.js app
- A PostgreSQL database with `pgvector`
- An Ollama-compatible model endpoint for chat and embeddings

### Option 1: VPS Deployment

This is the simplest production path for the current architecture because it can run Next.js, PostgreSQL, and Ollama from one server.

1. Provision a Linux server.
2. Install Node.js, Docker, and Ollama.
3. Clone the repository.
4. Create `.env` with production values.
5. Start PostgreSQL:

```bash
npm run db:up
```

6. Sign in to Ollama and pull models:

```bash
ollama signin
ollama pull embeddinggemma
ollama pull gpt-oss:20b-cloud
```

7. Build the index and ingest documents once:

```bash
npm run rag:recreate-index
npm run rag:ingest
```

8. Build and start the app:

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
- Use a public Ollama-compatible endpoint. For direct Ollama Cloud API access, create an Ollama API key and use a remote host instead of local Ollama.
- Ingest the documents from a machine that can reach the hosted Postgres database. Do not run long ingestion as part of the Vercel build.

Production environment variables:

```env
OLLAMA_BASE_URL=https://your-ollama-compatible-host/v1
OLLAMA_API_KEY=your-production-key
OLLAMA_CHAT_MODEL=your-chat-model
OLLAMA_EMBEDDING_MODEL=embeddinggemma
OLLAMA_EMBEDDING_DIMENSION=768
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

Important production note: this app currently uses a local SQLite file (`mastra.db`) for Mastra memory. On serverless platforms, local file writes are not durable. For a production Vercel deployment, move Mastra memory storage to a managed database or treat memory as ephemeral.

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
- sources appear in the frontend
- retrieval remains grounded in the letters

## Notes on Design Choices

- `createVectorQueryTool()` is used instead of a custom retrieval tool to stay aligned with Mastra's RAG patterns.
- `Memory` is configured for recent-message continuity, while the knowledge base itself lives in pgvector.
- The ingestion path deletes old chunks per source before upserting, so rerunning the script is safe.
- Ingestion writes vectors in small batches to avoid long PostgreSQL transactions during local setup.
- The UI stores the current thread locally so the same Mastra memory thread continues across refreshes.

## Known Requirements Before It Will Run End-to-End

- Ollama must be installed and signed in for the local cloud-model workflow.
- `embeddinggemma` and `gpt-oss:20b-cloud` must be available through Ollama.
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

- Mastra Next.js guide: https://mastra.ai/guides/getting-started/next-js
- Mastra vector databases: https://mastra.ai/docs/rag/vector-databases
- Mastra vector query tool: https://mastra.ai/en/reference/tools/vector-query-tool
- Mastra `Agent.stream()` reference: https://mastra.ai/reference/streaming/agents/stream
- Ollama Cloud: https://docs.ollama.com/cloud
- Ollama OpenAI compatibility: https://docs.ollama.com/api/openai-compatibility
- Vercel environment variables: https://vercel.com/docs/environment-variables
- Next.js production commands: https://nextjs.org/docs/app/getting-started/installation
