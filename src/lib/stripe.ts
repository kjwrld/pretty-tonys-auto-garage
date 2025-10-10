import { loadStripe } from '@stripe/stripe-js';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

// Only load Stripe if we have a real key (not placeholder)
export const stripePromise = stripePublishableKey && stripePublishableKey !== 'pk_test_placeholder' 
  ? loadStripe(stripePublishableKey)
  : null;