import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { CheckCircle, Loader2 } from 'lucide-react';

interface CheckoutSuccessProps {
  sessionId: string | null;
  onContinue: () => void;
}

export function CheckoutSuccess({ sessionId, onContinue }: CheckoutSuccessProps) {
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionId) {
      verifyPayment();
    }
  }, [sessionId]);

  const verifyPayment = async () => {
    try {
      const response = await fetch('/api/stripe/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ session_id: sessionId }),
      });

      if (!response.ok) {
        throw new Error('Failed to verify payment');
      }

      const data = await response.json();
      
      if (data.success) {
        setOrderDetails(data);
      } else {
        setError('Payment verification failed');
      }
    } catch (err) {
      setError('Failed to verify payment');
      console.error('Payment verification error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center py-8">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p className="text-sm text-muted-foreground">Verifying your payment...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !orderDetails) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Payment Verification Failed</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4">We couldn't verify your payment. Please contact support.</p>
            <Button onClick={onContinue}>Return to Store</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl uppercase tracking-wider">Order Confirmed!</CardTitle>
          <CardDescription>
            Thank you for your purchase from Pretty Tony's Autoshop
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Order Details */}
          <div className="border rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Order Total:</span>
              <span className="font-semibold">${orderDetails.amount_total?.toFixed(2)}</span>
            </div>
            
            {orderDetails.customer_email && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Email:</span>
                <span>{orderDetails.customer_email}</span>
              </div>
            )}
            
            {orderDetails.session_id && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Order ID:</span>
                <span className="font-mono text-xs">{orderDetails.session_id.slice(-8).toUpperCase()}</span>
              </div>
            )}
          </div>

          {/* Shipping Info */}
          {orderDetails.shipping_address && (
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold text-sm mb-2">Shipping Address</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                {orderDetails.customer_name && <p>{orderDetails.customer_name}</p>}
                <p>{orderDetails.shipping_address.line1}</p>
                {orderDetails.shipping_address.line2 && <p>{orderDetails.shipping_address.line2}</p>}
                <p>
                  {orderDetails.shipping_address.city}, {orderDetails.shipping_address.state} {orderDetails.shipping_address.postal_code}
                </p>
                <p>{orderDetails.shipping_address.country}</p>
              </div>
            </div>
          )}

          {/* What's Next */}
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold text-sm mb-2">What's Next?</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Order confirmation sent to your email</li>
              <li>• We'll prepare your items for shipping</li>
              <li>• Tracking info will be emailed once shipped</li>
              <li>• Questions? Contact us at orders@prettytony.shop</li>
            </ul>
          </div>

          <Button onClick={onContinue} className="w-full">
            Continue Shopping
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}