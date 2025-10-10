import { X, Plus, Minus, Trash2 } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Product } from './ProductCard';
import { StripeCheckout } from './StripeCheckout';
import { useState } from 'react';

interface CartViewProps {
  cart: Map<string, number>;
  products: Product[];
  onClose: () => void;
  onUpdateQuantity: (cartKey: string, quantity: number) => void;
  onRemoveItem: (cartKey: string) => void;
}

export function CartView({ cart, products, onClose, onUpdateQuantity, onRemoveItem }: CartViewProps) {
  const [showCheckout, setShowCheckout] = useState(false);
  const cartItems = Array.from(cart.entries()).map(([cartKey, quantity]) => {
    const parts = cartKey.split('-');
    const productId = parts[0];
    const variantOrSize = parts.length > 1 ? parts.slice(1).join('-') : undefined;
    const product = products.find(p => p.id === productId)!;
    
    let price = product.price;
    let variantName = '';
    
    // Check if it's a variant (raffle tickets)
    if (variantOrSize && product.variants) {
      const variant = product.variants.find(v => v.id === variantOrSize);
      if (variant) {
        price = variant.price;
        variantName = variant.name;
      }
    }
    // Check if it's a size (shirts)
    else if (variantOrSize && product.sizes) {
      variantName = `Size ${variantOrSize}`;
    }
    
    return {
      cartKey,
      product,
      variantName,
      price,
      quantity,
    };
  });

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 0 ? 10.00 : 0;
  const total = subtotal + shipping;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm">
      <div className="h-full flex flex-col md:flex-row md:justify-end">
        {/* Cart Panel - Full screen on mobile, side panel on desktop */}
        <div className="w-full md:w-[500px] lg:w-[600px] h-full bg-white border-l-4 border-black flex flex-col cart-slide-in">
          {/* Technical Header */}
          <div className="relative border-b-2 border-black p-4 md:p-6 bg-white">
            {/* Corner Brackets */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-red-500" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-red-500" />
            
            {/* System Labels */}
            <div className="flex items-center justify-between mb-3">
              <div className="text-[10px] text-black/50 uppercase tracking-wider">
                CART_SYSTEM_V2.0
              </div>
              <div className="flex items-center gap-2">
                <span className="text-red-500 pulse-red">●</span>
                <span className="text-[10px] text-black/50 uppercase tracking-wider">
                  ACTIVE
                </span>
              </div>
            </div>

            {/* Main Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl md:text-3xl uppercase tracking-tight text-black mb-1" style={{ fontWeight: 900 }}>
                  SHOPPING CART
                </h2>
                <div className="text-[10px] text-black/50 uppercase tracking-wider">
                  {cartItems.length} ITEM{cartItems.length !== 1 ? 'S' : ''} LOADED
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="p-2 border-2 border-black bg-white hover:bg-red-500 hover:border-red-500 transition-all group"
                aria-label="Close cart"
              >
                <X className="w-5 h-5 text-black group-hover:text-white" />
              </button>
            </div>

            {/* Divider */}
            <div className="h-px bg-black/20 mt-4" />
          </div>

          {/* Cart Items - Scrollable */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            {cartItems.length === 0 ? (
              // Empty State
              <div className="h-full flex items-center justify-center">
                <div className="text-center space-y-4">
                  {/* Technical Empty Icon */}
                  <div className="relative w-32 h-32 mx-auto border-2 border-black/20 bg-white">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 border-2 border-black/20" />
                    </div>
                    <div className="absolute top-1/2 left-0 w-full h-px bg-black/10" />
                    <div className="absolute top-0 left-1/2 w-px h-full bg-black/10" />
                    
                    {/* Corner Markers */}
                    <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-black/20" />
                    <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-black/20" />
                    <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-black/20" />
                    <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-black/20" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-[10px] text-black/30 uppercase tracking-wider">
                      STATUS: EMPTY
                    </div>
                    <div className="h-px bg-black/10 w-32 mx-auto" />
                    <p className="text-black/50 uppercase tracking-wider text-xs">
                      No items in cart
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              // Cart Items
              <div className="space-y-4">
                {cartItems.map(({ cartKey, product, variantName, price, quantity }, index) => {
                  const sku = `ITEM-${product.id.padStart(4, '0')}`;
                  
                  return (
                    <div key={cartKey} className="reveal-top" style={{ animationDelay: `${index * 0.1}s` }}>
                      {/* Item Header */}
                      <div className="flex items-center justify-between mb-2 pb-1 border-b border-black/20">
                        <span className="text-[10px] text-black/50 tracking-wider">{sku}</span>
                        <button
                          onClick={() => onRemoveItem(cartKey)}
                          className="text-[10px] text-red-500 hover:text-red-600 uppercase tracking-wider flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          REMOVE
                        </button>
                      </div>

                      {/* Item Content */}
                      <div className="flex gap-4 p-3 border-2 border-black/20 bg-white relative">
                        {/* Corner Bracket */}
                        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-red-500/30" />
                        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-red-500/30" />

                        {/* Product Image */}
                        <div className="relative w-20 h-24 md:w-24 md:h-32 border-2 border-black/20 flex-shrink-0 bg-white">
                          <ImageWithFallback
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                          {/* Crosshair */}
                          <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute top-1/2 left-0 w-full h-px bg-red-500/20" />
                            <div className="absolute top-0 left-1/2 w-px h-full bg-red-500/20" />
                          </div>
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="uppercase tracking-wide text-black text-sm md:text-base mb-1" style={{ fontWeight: 700 }}>
                              {product.name}
                            </h3>
                            {variantName && (
                              <p className="text-[10px] text-red-500 uppercase tracking-wider mb-1">
                                {variantName}
                              </p>
                            )}
                            <p className="text-[10px] text-black/50 uppercase tracking-wider mb-2">
                              {product.description}
                            </p>
                          </div>

                          {/* Quantity Controls & Price */}
                          <div className="flex items-end justify-between gap-2">
                            {/* Quantity Controls */}
                            <div className="flex items-center border-2 border-black">
                              <button
                                onClick={() => onUpdateQuantity(cartKey, Math.max(1, quantity - 1))}
                                className="p-1.5 hover:bg-black hover:text-white transition-all"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <div className="px-3 py-1.5 border-x-2 border-black text-xs uppercase tracking-wider min-w-[3rem] text-center">
                                {quantity}
                              </div>
                              <button
                                onClick={() => onUpdateQuantity(cartKey, quantity + 1)}
                                className="p-1.5 hover:bg-black hover:text-white transition-all"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            {/* Price */}
                            <div className="text-right">
                              <div className="text-[10px] text-black/50 uppercase tracking-wider">
                                UNIT: ${price.toFixed(2)}
                              </div>
                              <div className="text-red-500 uppercase tracking-wider" style={{ fontWeight: 900 }}>
                                ${(price * quantity).toFixed(2)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Cart Summary - Fixed at bottom */}
          {cartItems.length > 0 && (
            <div className="border-t-2 border-black p-4 md:p-6 bg-white">
              {/* Technical Header */}
              <div className="flex items-center gap-2 mb-4">
                <div className="h-px flex-1 bg-red-500/30" />
                <span className="text-[10px] text-black/50 uppercase tracking-wider">Order Summary</span>
                <div className="h-px flex-1 bg-red-500/30" />
              </div>

              {/* Summary Lines */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-xs uppercase tracking-wider">
                  <span className="text-black/70">Subtotal</span>
                  <span className="text-black">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-xs uppercase tracking-wider">
                  <span className="text-black/70">Shipping</span>
                  <span className="text-black">${shipping.toFixed(2)}</span>
                </div>
                <div className="h-px bg-black/20" />
                <div className="flex items-center justify-between pt-2">
                  <span className="text-black uppercase tracking-wider" style={{ fontWeight: 700 }}>Total</span>
                  <span className="text-black-500 text-xl uppercase tracking-tight" style={{ fontWeight: 900 }}>
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <div className="relative group">
                {/* Button Corner Brackets */}
                <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-red-500 transition-all group-hover:w-6 group-hover:h-6" />
                <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-red-500 transition-all group-hover:w-6 group-hover:h-6" />
                <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-red-500 transition-all group-hover:w-6 group-hover:h-6" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-red-500 transition-all group-hover:w-6 group-hover:h-6" />
                
                <button 
                  onClick={() => setShowCheckout(true)}
                  className="relative w-full border-4 border-black bg-black text-white py-4 hover:bg-red-500 hover:border-red-500 transition-all duration-300 overflow-hidden"
                >
                  {/* Scan line effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute top-0 left-0 w-full h-px bg-white scan-line" />
                  </div>
                  
                  {/* Button content */}
                  <div className="relative flex items-center justify-center gap-3">
                    <div className="h-px w-6 bg-white/30 group-hover:bg-white/60 transition-all" />
                    <span className="uppercase tracking-[0.2em]" style={{ fontWeight: 900 }}>
                      Proceed to Checkout
                    </span>
                    <div className="h-px w-6 bg-white/30 group-hover:bg-white/60 transition-all" />
                  </div>
                  
                  {/* Technical markers */}
                  <div className="absolute top-2 left-2 text-[8px] text-white/40 uppercase tracking-wider group-hover:text-white/80 transition-all">
                    Execute
                  </div>
                  <div className="absolute top-2 right-2 text-[8px] text-white/40 uppercase tracking-wider group-hover:text-white/80 transition-all">
                    {'>>'}
                  </div>
                </button>
              </div>

              {/* System Info */}
              <div className="flex items-center justify-center gap-2 text-[8px] text-black/30 uppercase tracking-wider mt-3">
                <span>Secure Checkout</span>
                <div className="w-1 h-1 bg-black/20" />
                <span className="text-red-500/50">Encrypted</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <StripeCheckout
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        cart={cart}
        products={products}
      />
    </div>
  );
}
