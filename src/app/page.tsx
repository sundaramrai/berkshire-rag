import { BerkshireChat } from "@/components/berkshire-chat";

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(202,138,4,0.14),transparent_28%),linear-gradient(180deg,#faf7ef_0%,#f4efe3_48%,#efe6d2_100%)] px-4 py-6 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-7xl flex-col rounded-4xl border border-amber-900/10 bg-white/70 shadow-[0_30px_120px_rgba(71,57,36,0.18)] backdrop-blur">
        <section className="border-b border-amber-900/10 px-6 py-8 sm:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-4">
              <span className="inline-flex w-fit rounded-full border border-emerald-900/15 bg-emerald-950 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-100">
                Mastra RAG Assignment
              </span>
              <div className="space-y-3">
                <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
                  Berkshire Hathaway Intelligence
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-slate-700 sm:text-base">
                  Ask grounded questions about Warren Buffett&rsquo;s investment
                  philosophy across Berkshire Hathaway shareholder letters from
                  1977 through 2024, with streaming answers and source-aware
                  retrieval.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-amber-900/10 bg-amber-50/80 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Retrieval
                </p>
                <p className="mt-2 text-sm font-semibold">PostgreSQL + pgvector</p>
              </div>
              <div className="rounded-2xl border border-amber-900/10 bg-amber-50/80 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Model
                </p>
                <p className="mt-2 text-sm font-semibold">OpenAI GPT-4o</p>
              </div>
              <div className="rounded-2xl border border-amber-900/10 bg-amber-50/80 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Coverage
                </p>
                <p className="mt-2 text-sm font-semibold">1977 to 2024 Letters</p>
              </div>
            </div>
          </div>
        </section>

        <BerkshireChat />
      </div>
    </main>
  );
}
