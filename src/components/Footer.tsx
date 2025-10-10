import { Youtube, Instagram, Music } from 'lucide-react';

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
          {/* Social Media Links */}
          <div className="flex items-center justify-center gap-6 mb-8">
            <a 
              href="https://www.youtube.com/@10piecetone" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center w-12 h-12 bg-transparent hover:bg-white transition-all duration-300 group"
              aria-label="YouTube"
            >
              <Youtube className="w-6 h-6 text-white group-hover:text-black" />
            </a>
            
            <a 
              href="https://www.instagram.com/10piecetone/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center w-12 h-12 bg-transparent hover:bg-white transition-all duration-300 group"
              aria-label="Instagram"
            >
              <Instagram className="w-6 h-6 text-white group-hover:text-black" />
            </a>
            
            <a 
              href="https://music.apple.com/us/artist/10piece-tone/1593442991" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center w-12 h-12 bg-transparent hover:bg-white transition-all duration-300 group"
              aria-label="Apple Music"
            >
              <Music className="w-6 h-6 text-white group-hover:text-black" />
            </a>
            
            <a 
              href="https://open.spotify.com/artist/5P59pOOAyEdtB68GSFvCQM?si=h8TSW-zhTeeBJK9KkaexTg&nd=1&dlsi=e49033ae8e1f4843" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center w-12 h-12 bg-transparent hover:bg-white transition-all duration-300 group"
              aria-label="Spotify"
            >
              <svg className="w-6 h-6 text-white group-hover:text-black" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
            </a>
          </div>

          {/* Bottom Section */}
          <div className="flex flex-col items-center justify-center gap-4">
            {/* Copyright */}
            <div className="text-[10px] text-white/70 uppercase tracking-wider text-center">
              <span>© 2025 Pretty Tony's Autoshop</span>
              <span className="mx-2">●</span>
              <span>All Rights Reserved</span>
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
