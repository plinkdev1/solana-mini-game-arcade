export default function Loading() {
  return (
    <div className="flex-1 flex items-center justify-center text-neon-cyan/50">
      <div className="space-y-4">
        <div className="h-8 w-32 bg-neon-pink/20 rounded animate-pulse" />
        <div className="h-64 w-96 bg-neon-pink/10 rounded animate-pulse" />
      </div>
    </div>
  )
}
