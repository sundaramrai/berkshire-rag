import { BerkshireChat } from "@/components/berkshire-chat";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7f5ef] px-4 py-4 text-slate-950 sm:px-6 sm:py-6">
      <div className="mx-auto flex h-[calc(100vh-2rem)] w-full max-w-5xl flex-col overflow-hidden border border-slate-200 bg-white shadow-sm sm:h-[calc(100vh-3rem)]">
        <BerkshireChat />
      </div>
    </main>
  );
}
