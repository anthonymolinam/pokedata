export default function LoadingHome() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-60 bg-zinc-800 rounded-lg" />
        <div className="h-4 w-40 bg-zinc-800/60 rounded" />
      </div>

      <div className="h-10 w-full max-w-md bg-zinc-900 rounded-xl border border-zinc-800" />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {[...Array(24)].map((_, i) => (
          <div
            key={i}
            className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-4 flex flex-col items-center h-48"
          >
            <div className="self-end w-8 h-3 bg-zinc-800/80 rounded mb-2" />
            <div className="w-24 h-24 bg-zinc-800/60 rounded-full my-1" />
            <div className="w-16 h-4 bg-zinc-800 rounded mt-2" />
          </div>
        ))}
      </div>
    </div>
  );
}
