import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '../lib/stripe';

interface StripeProviderProps {
  children: React.ReactNode;
}

export function StripeProvider({ children }: StripeProviderProps) {
  // If Stripe is not configured, just render children without Elements wrapper
  if (!stripePromise) {
    return <>{children}</>;
  }

  return (
    <Elements stripe={stripePromise}>
      {children}
    </Elements>
  );
}