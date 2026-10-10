# Berkshire Hathaway Intelligence

Source-grounded RAG for analyzing Berkshire Hathaway shareholder letters from 1977–2024.

**Live app:** <https://berkshire-rag.vercel.app/>

## What it does

Ask questions about Buffett's investment philosophy, Berkshire's business strategy,
acquisitions, and themes across shareholder letters. The assistant retrieves relevant
letter excerpts, answers from that evidence, and links to the source letters it used.

## Highlights

- Searches 48 annual shareholder letters with Mistral embeddings and pgvector.
- Supports year-based filtering for focused questions, such as a specific annual letter.
- Preserves conversational context with PostgreSQL-backed Mastra memory.
- Streams Markdown responses and displays clickable links to the relevant letters.
- Re-ingests documents safely by replacing vectors for each source file.
- Disables unused Mastra background workers to prevent unnecessary database polling in deployed runtimes.

## Architecture

```text
Shareholder-letter PDFs
        │
        ▼
PDF extraction → recursive chunking → Mistral embeddings → PostgreSQL / pgvector
                                                            │
                                                            ▼
Next.js chat UI → Mastra agent → vector retrieval → grounded streamed response
```

## Stack

- Next.js + TypeScript
- Mastra + AI SDK
- Mistral `mistral-embed`
- Ollama-compatible chat model
- PostgreSQL + pgvector
- Vercel

## Run locally

### 1. Configure services

Copy `.env.example` to `.env`, then provide an Ollama-compatible chat endpoint,
a Mistral API key, and a PostgreSQL connection string with pgvector enabled.

```env
OLLAMA_BASE_URL=http://localhost:11434/v1
OLLAMA_API_KEY=ollama
OLLAMA_CHAT_MODEL=gpt-oss:20b-cloud
MISTRAL_API_KEY=your-mistral-api-key
POSTGRES_CONNECTION_STRING=postgresql://postgres:postgres@localhost:5432/berkshire
```

### 2. Load the corpus

Place the 1977–2024 Berkshire shareholder-letter PDFs in `src/documents/`, then run:

```bash
npm install
npm run db:up
npm run rag:create-index
npm run rag:ingest
```

### 3. Start the app

```bash
npm run dev
```

Open <http://localhost:3000>.

## Useful commands

```bash
npm run lint
npm run typecheck
npm run build
npm run rag:recreate-index
npm run rag:ingest
```

## Deployment

The public app runs on Vercel. Production requires a hosted pgvector-compatible
PostgreSQL database, a reachable Ollama-compatible model endpoint, and Mistral
embedding credentials. Ingest the corpus from a machine that can reach the hosted
database; do not ingest during the Vercel build.

Mastra Cloud is optional for Studio and API inspection—the Vercel chat route runs
the agent directly. If both are deployed, they share the same PostgreSQL database.
