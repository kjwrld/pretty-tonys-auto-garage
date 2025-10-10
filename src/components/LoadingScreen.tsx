import { useEffect, useState } from 'react';

export function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [systemText, setSystemText] = useState('INITIALIZING SYSTEM...');

  useEffect(() => {
    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    // System text updates
    const textUpdates = [
      { time: 500, text: 'LOADING MODULES...' },
      { time: 1000, text: 'CALIBRATING GRID SYSTEM...' },
      { time: 1500, text: 'MOUNTING COMPONENTS...' },
      { time: 2000, text: 'SYNCHRONIZING DATA...' },
      { time: 2500, text: 'SYSTEM READY' },
    ];

    textUpdates.forEach(({ time, text }) => {
      setTimeout(() => setSystemText(text), time);
    });

    return () => clearInterval(progressInterval);
  }, []);

  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center loading-screen">
      {/* Corner Brackets */}
      <div className="absolute top-8 left-8 w-16 h-16 border-t-2 border-l-2 border-black/20 loading-bracket-tl" />
      <div className="absolute top-8 right-8 w-16 h-16 border-t-2 border-r-2 border-black/20 loading-bracket-tr" />
      <div className="absolute bottom-8 left-8 w-16 h-16 border-b-2 border-l-2 border-black/20 loading-bracket-bl" />
      <div className="absolute bottom-8 right-8 w-16 h-16 border-b-2 border-r-2 border-black/20 loading-bracket-br" />

      {/* Grid Lines */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 technical-grid" />
      </div>

      {/* Coordinate Markers */}
      <div className="absolute top-4 left-4 text-[10px] text-black/30 uppercase tracking-wider boot-up">
        X: 0000 | Y: 0000
      </div>
      <div className="absolute top-4 right-4 text-[10px] text-black/30 uppercase tracking-wider boot-up">
        SYS_V2.0
      </div>
      <div className="absolute bottom-4 left-4 text-[10px] text-black/30 uppercase tracking-wider boot-up">
        PRETTY TONY'S AUTOSHOP
      </div>
      <div className="absolute bottom-4 right-4 text-[10px] uppercase tracking-wider boot-up">
        <span className="pulse-red">●</span> ONLINE
      </div>

      {/* Central Loading Content */}
      <div className="relative w-full max-w-2xl px-8">
        {/* Main Logo/Title */}
        <div className="text-center mb-12">
          <div className="text-[10px] text-black/50 uppercase tracking-wider mb-2 boot-up">
            SYSTEM INTERFACE
          </div>
          <div className="h-px bg-black/20 mb-6 loading-line-expand" />
          
          <h1 className="text-4xl md:text-5xl uppercase tracking-tight mb-2 text-black loading-title-reveal">
            PRETTY TONY'S
          </h1>
          <div className="text-lg md:text-xl uppercase tracking-widest text-black/70 loading-subtitle-reveal">
            AUTOSHOP
          </div>

          <div className="h-px bg-black/20 mt-6 loading-line-expand" />
        </div>

        {/* Pulsing Center Element */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 border-4 border-black/10 border-t-red-500 rounded-full animate-spin" />
        </div>

        {/* System Status Text */}
        <div className="text-center mb-8">
          <div className="text-sm uppercase tracking-wider text-black/70 mb-2 system-text-blink">
            {systemText}
          </div>
          <div className="flex items-center justify-center gap-2 text-[10px] text-black/50">
            <div className="w-1 h-1 bg-red-500 pulse-dot" />
            <div className="w-1 h-1 bg-red-500 pulse-dot" style={{ animationDelay: '0.2s' }} />
            <div className="w-1 h-1 bg-red-500 pulse-dot" style={{ animationDelay: '0.4s' }} />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative">
          <div className="flex items-center justify-between text-[10px] text-black/50 uppercase tracking-wider mb-2">
            <span>LOADING</span>
            <span>{progress}%</span>
          </div>
          
          <div className="relative h-2 bg-black/10 border border-black/20 overflow-hidden">
            <div 
              className="absolute inset-y-0 left-0 bg-red-500 transition-all duration-100 ease-linear progress-bar-fill"
              style={{ width: `${progress}%` }}
            />
            <div className="absolute inset-0 flex">
              {[...Array(20)].map((_, i) => (
                <div key={i} className="flex-1 border-r border-black/10" />
              ))}
            </div>
          </div>

          {/* Technical Labels */}
          <div className="flex items-center justify-between text-[10px] text-black/30 uppercase tracking-wider mt-2">
            <span>START</span>
            <span className="text-black/50">BUFFER: {Math.floor(progress * 0.8)}%</span>
            <span>END</span>
          </div>
        </div>

        {/* System Diagnostics */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-[10px] text-black/40 uppercase tracking-wider">
          <div className="text-center boot-up" style={{ animationDelay: '0.1s' }}>
            <div className="mb-1">CPU</div>
            <div className="text-black/30">OK</div>
          </div>
          <div className="text-center boot-up" style={{ animationDelay: '0.2s' }}>
            <div className="mb-1">MEMORY</div>
            <div className="text-black/30">OK</div>
          </div>
          <div className="text-center boot-up" style={{ animationDelay: '0.3s' }}>
            <div className="mb-1">NETWORK</div>
            <div className="text-black/30">OK</div>
          </div>
        </div>
      </div>

      {/* Scanning Lines */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-500 to-transparent loading-scan-horizontal" />
        <div className="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-transparent via-red-500 to-transparent loading-scan-vertical" />
      </div>
    </div>
  );
}
