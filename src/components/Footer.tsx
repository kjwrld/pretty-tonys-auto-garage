import { NewsletterSignup } from './NewsletterSignup';

export function Footer() {
  return (
    <footer className="border-t-4 border-black bg-red-500 mt-12">
      {/* Technical Grid Background */}
      <div className="relative">
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }} />
        
        <div className="relative max-w-7xl mx-auto px-4 py-12">
          {/* Newsletter Section */}
          <div className="mb-8">
            <NewsletterSignup className="max-w-md mx-auto" />
          </div>

          {/* Divider Line */}
          <div className="relative mb-8">
            <div className="h-px bg-white/40" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 bg-red-500">
              <div className="flex items-center gap-2">
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <div className="text-[10px] text-white/70 uppercase tracking-wider text-center md:text-left">
              <span>© 2025 Pretty Tony's Autoshop</span>
              <span className="mx-2">●</span>
              <span>All Rights Reserved</span>
            </div>

            {/* System Info */}
            <div className="flex items-center gap-4 text-[10px] text-white/60 uppercase tracking-wider">
              <span>Site_v2.0</span>
              <div className="w-px h-3 bg-white/30" />
              <span className="flex items-center gap-1">
                <span className="text-white">●</span>
                Online
              </span>
              <div className="w-px h-3 bg-white/30" />
              <span>Secure</span>
            </div>
          </div>

          {/* Technical Corner Brackets */}
          <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-white/50" />
          <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-white/50" />
        </div>
      </div>
    </footer>
  );
}
