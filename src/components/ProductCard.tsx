import { ShoppingCart } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  price: number;
  originalPrice: number;
  image: string;
  additionalImages: string[];
  variants?: ProductVariant[];
  sizes?: string[];
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: string, quantity: number, variantOrSize?: string) => void;
  onClick: (productId: string) => void;
}

export function ProductCard({ product, onAddToCart, onClick }: ProductCardProps) {
  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  const sku = `ITEM-${product.id.padStart(4, '0')}`;

  return (
    <div className="group cursor-pointer reveal-top">
      {/* Technical Header */}
      <div className="flex items-center justify-between mb-2 pb-1 border-b border-black/20">
        <span className="text-[10px] text-black/50 tracking-wider">{sku}</span>
        <span className="text-[10px] text-red-500">●REC</span>
      </div>

      <div className="relative aspect-[3/4] mb-3 overflow-hidden bg-white border-2 border-black/20 scan-effect bracket-container">
        {/* Animated Corner Brackets */}
        <div className="bracket top-left" />
        <div className="bracket top-right" />
        <div className="bracket bottom-left" />
        <div className="bracket bottom-right" />

        {/* Crosshair Grid Overlay */}
        <div className="absolute inset-0 z-10 pointer-events-none grid-pulse">
          <div className="absolute top-1/2 left-0 w-full h-px bg-red-500/30" />
          <div className="absolute top-0 left-1/2 w-px h-full bg-red-500/30" />
        </div>

        {/* Product Image/Video */}
        {product.image.endsWith('.mp4') ? (
          <video
            src={product.image}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
            onClick={() => onClick(product.id)}
          />
        ) : (
          <ImageWithFallback
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
            onClick={() => onClick(product.id)}
          />
        )}

        {/* Discount Badge */}
        {discount > 0 && (
          <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 border border-black uppercase text-xs tracking-wider z-20 font-bold">
            -{discount}%
          </div>
        )}

        {/* Technical Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white/90 to-transparent p-2 z-10">
          <div className="text-[8px] text-black/50 uppercase tracking-wider">PREVIEW_MODE</div>
        </div>

        {/* Cart Icon */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            // For raffle tickets (product id 4), default to 1-ticket variant
            if (product.id === '4' && product.variants) {
              onAddToCart(product.id, 1, '1-ticket');
            } else {
              onAddToCart(product.id, 1);
            }
          }}
          className="absolute top-3 right-3 p-2 border-2 border-black bg-white hover:bg-red-500 hover:border-red-500 transition-all z-20 group/cart"
          aria-label="Add to cart"
        >
          <ShoppingCart className="w-4 h-4 text-black group-hover/cart:text-white" />
        </button>
      </div>

      {/* Product Info */}
      <div onClick={() => onClick(product.id)} className="space-y-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="uppercase tracking-wide text-black font-bold">{product.name}</h3>
        </div>
        <p className="text-[10px] text-black/50 uppercase tracking-wider">{product.description}</p>
        
        {/* Technical Divider */}
        <div className="flex items-center gap-2 pt-2">
          <div className="h-px flex-1 bg-black/10" />
          <span className="text-[8px] text-black/30">PRICING</span>
          <div className="h-px flex-1 bg-black/10" />
        </div>

        <div className="flex items-center gap-3 pt-1">
          <span className="text-black/40 price-slash text-sm font-bold">${product.originalPrice.toFixed(2)}</span>
          <span className="text-red-500 price-fade-in tracking-wider font-bold">${product.price.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
