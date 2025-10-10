import { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Product } from './ProductCard';
import { toast } from 'sonner';

interface StripeCheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  cart: Map<string, number>;
  products: Product[];
}

export function StripeCheckout({ isOpen, onClose, cart, products }: StripeCheckoutProps) {
  const [loading, setLoading] = useState(false);

  const calculateTotal = () => {
    let total = 0;
    
    cart.forEach((quantity, cartKey) => {
      const parts = cartKey.split('-');
      const productId = parts[0];
      const variantOrSize = parts.length > 1 ? parts.slice(1).join('-') : undefined;
      
      const product = products.find(p => p.id === productId);
      if (product) {
        if (variantOrSize && product.variants) {
          const variant = product.variants.find(v => v.id === variantOrSize);
          total += (variant?.price || product.price) * quantity;
        } else {
          total += product.price * quantity;
        }
      }
    });
    
    return total + 10.00; // Add shipping
  };

  const handleCheckout = async () => {
    setLoading(true);
    
    try {
      // Convert cart Map to object for API
      const cartObject = Object.fromEntries(cart);
      
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cart: cartObject,
          currency: 'usd',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();
      
      // Redirect to Stripe checkout
      window.location.href = url;
      
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to start checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getCartSummary = () => {
    const items = [];
    cart.forEach((quantity, cartKey) => {
      const parts = cartKey.split('-');
      const productId = parts[0];
      const variantOrSize = parts.length > 1 ? parts.slice(1).join('-') : undefined;
      
      const product = products.find(p => p.id === productId);
      if (product) {
        let name = product.name;
        let price = product.price;
        
        if (variantOrSize && product.variants) {
          const variant = product.variants.find(v => v.id === variantOrSize);
          if (variant) {
            name = `${product.name} - ${variant.name}`;
            price = variant.price;
          }
        } else if (variantOrSize && product.sizes) {
          name = `${product.name} - Size ${variantOrSize}`;
        }
        
        items.push({ name, price, quantity });
      }
    });
    return items;
  };

  if (!isOpen) return null;

  const total = calculateTotal();
  const cartItems = getCartSummary();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" aria-describedby="checkout-description">
        <DialogHeader>
          <DialogTitle className="text-center uppercase tracking-wider">
            Checkout Summary
          </DialogTitle>
        </DialogHeader>
        
        <div id="checkout-description" className="sr-only">
          Complete your purchase for Pretty Tony's Autoshop merchandise
        </div>
        
        <div className="space-y-4">
          {/* Cart Items */}
          <div className="space-y-2">
            {cartItems.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span>{item.name} (×{item.quantity})</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="flex justify-between text-sm border-t pt-2">
              <span>Shipping</span>
              <span>$10.00</span>
            </div>
            <div className="flex justify-between font-semibold border-t pt-2">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Checkout Button */}
          <div className="flex gap-3">
            <Button 
              onClick={handleCheckout}
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Loading...' : `Pay $${total.toFixed(2)}`}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            You'll be redirected to Stripe's secure checkout
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}