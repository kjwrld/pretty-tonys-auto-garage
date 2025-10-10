import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';
import { subscribeToMailChimp } from '../lib/mailchimp';

interface NewsletterSignupProps {
  className?: string;
}

export function NewsletterSignup({ className }: NewsletterSignupProps) {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Email is required');
      return;
    }

    setIsLoading(true);
    
    try {
      await subscribeToMailChimp({
        email,
        firstName: firstName || undefined,
      });
      
      toast.success('Successfully subscribed to newsletter!');
      setEmail('');
      setFirstName('');
    } catch (error) {
      toast.error('Failed to subscribe. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="uppercase tracking-wider text-sm">Stay Updated</CardTitle>
        <CardDescription>
          Get notified about new products, exclusive deals, and garage updates
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            type="text"
            placeholder="First Name (optional)"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            disabled={isLoading}
          />
          <Input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
          />
          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Subscribing...' : 'Subscribe'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}