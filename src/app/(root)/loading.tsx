export default function Loading() {
  return (
    <>
      {/* Top progress bar */}
      <div className="fixed inset-x-0 top-0 z-[1000] h-0.5 overflow-hidden">
        <div className="h-full w-1/3 bg-black/80 animate-topbar" />
      </div>

      {/* Pulse dot no canto (sutil) */}
      <div className="fixed right-4 top-4 z-[1000]">
        <div className="h-2.5 w-2.5 rounded-full bg-black/70 animate-pulse" />
      </div>
    </>
  )
}