import { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';

interface CheckoutFormProps {
  amount: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CheckoutForm({ amount, onSuccess, onCancel }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/success`,
        },
      });

      if (error) {
        toast.error(`Payment failed: ${error.message}`);
      } else {
        toast.success('Payment successful!');
        onSuccess?.();
      }
    } catch (err) {
      toast.error('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center uppercase tracking-wider">Checkout</CardTitle>
        <CardDescription className="text-center">
          Total: ${amount.toFixed(2)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <PaymentElement />
          
          <div className="flex gap-3">
            <Button 
              type="submit" 
              disabled={!stripe || isLoading}
              className="flex-1"
            >
              {isLoading ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
            </Button>
            
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}