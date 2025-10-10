import { ShoppingCart } from 'lucide-react';
import logoImage from 'figma:asset/e87a4c46c166dd312d5bfa2d78a27dff2ae256ba.png';

interface NavbarProps {
  cartCount: number;
  onCartClick: () => void;
  onLogoClick: () => void;
}

export function Navbar({ cartCount, onCartClick, onLogoClick }: NavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-black/20 bg-white/95">
      <div className="max-w-7xl mx-auto">
        {/* Technical Header Bar */}
        <div className="flex items-center justify-between px-4 py-1 border-b border-black/10 text-[10px] text-black/50">
          <div className="flex items-center gap-4">
            <span>SYSTEM: ONLINE</span>
            <span className="text-red-500">●</span>
            <span>LAT: 40.7128°N</span>
            <span>LONG: 74.0060°W</span>
          </div>
          <div className="flex items-center gap-4">
            <span>STATUS: OPERATIONAL</span>
            <span>UTC: {new Date().toISOString().slice(11, 19)}</span>
          </div>
        </div>

        {/* Main Nav */}
        <div className="flex items-center justify-between px-4 py-4">
          {/* Logo Section */}
          <button 
            onClick={onLogoClick}
            className="flex items-center gap-3 group reveal-left"
          >
            <div className="relative w-12 h-12 flex items-center justify-center">
              <img 
                src={logoImage} 
                alt="Pretty Tony's Autoshop Logo" 
                className="w-full h-full object-contain"
              />
              <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-red-500" />
              <div className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-red-500" />
              <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-red-500" />
              <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-red-500" />
            </div>
            <div className="hidden sm:block">
              <div className="text-[10px] text-black/50 uppercase tracking-wider">SYSTEM_ID</div>
              <div className="text-black uppercase tracking-wider group-hover:text-red-500 transition-colors">
                Pretty Tony's Autoshop
              </div>
            </div>
          </button>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button 
              onClick={onCartClick}
              className="relative px-4 py-2 border-2 border-black hover:border-red-500 hover:bg-red-500 transition-all group"
              aria-label="Shopping cart"
            >
              <ShoppingCart className="w-5 h-5 text-black group-hover:text-white transition-colors" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white border border-black px-2 py-0.5 text-xs font-bold min-w-[20px] text-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
