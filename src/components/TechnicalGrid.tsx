export function TechnicalGrid() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {/* Main Grid */}
      <div className="technical-grid w-full h-full opacity-50" />
      
      {/* Coordinate Lines */}
      <div className="absolute top-0 left-1/4 w-px h-full bg-black/5" />
      <div className="absolute top-0 left-1/2 w-px h-full bg-black/10" />
      <div className="absolute top-0 left-3/4 w-px h-full bg-black/5" />
      <div className="absolute top-1/4 left-0 w-full h-px bg-black/5" />
      <div className="absolute top-1/2 left-0 w-full h-px bg-black/10" />
      <div className="absolute top-3/4 left-0 w-full h-px bg-black/5" />
      
      {/* Corner Calibration Marks */}
      <div className="absolute top-4 left-4 text-[10px] text-red-500 font-mono calibration-blink">
        [00:00]
      </div>
      <div className="absolute top-4 right-4 text-[10px] text-red-500 font-mono calibration-blink">
        [SYS:ACTIVE]
      </div>
      <div className="absolute bottom-4 left-4 text-[10px] text-black/40 font-mono">
        GRID:ENABLED
      </div>
      <div className="absolute bottom-4 right-4 text-[10px] text-black/40 font-mono">
        v2.0.25
      </div>
    </div>
  );
}
