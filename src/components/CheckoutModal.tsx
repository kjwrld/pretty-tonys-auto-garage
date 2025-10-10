import { useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '../lib/stripe';
import { CheckoutForm } from './CheckoutForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Product } from './ProductCard';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: Map<string, number>;
  products: Product[];
}

export function CheckoutModal({ isOpen, onClose, cart, products }: CheckoutModalProps) {
  const [clientSecret, setClientSecret] = useState<string>('');
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
    
    return total;
  };

  const createPaymentIntent = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(calculateTotal() * 100), // Convert to cents
          currency: 'usd',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const { clientSecret } = await response.json();
      setClientSecret(clientSecret);
    } catch (error) {
      console.error('Error creating payment intent:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && cart.size > 0) {
      createPaymentIntent();
    }
  }, [isOpen, cart]);

  const handleSuccess = () => {
    onClose();
    // Clear cart logic would go here
  };

  if (!isOpen) return null;

  const total = calculateTotal();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center uppercase tracking-wider">
            Secure Checkout
          </DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-muted-foreground">Initializing payment...</div>
          </div>
        ) : clientSecret ? (
          <Elements 
            stripe={stripePromise} 
            options={{ 
              clientSecret,
              appearance: {
                theme: 'stripe',
                variables: {
                  colorPrimary: '#000000',
                }
              }
            }}
          >
            <CheckoutForm 
              amount={total}
              onSuccess={handleSuccess}
              onCancel={onClose}
            />
          </Elements>
        ) : (
          <div className="text-center py-8">
            <div className="text-sm text-muted-foreground">Failed to initialize payment</div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}