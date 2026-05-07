import React, { useState } from 'react';
import { Mail, Send } from 'lucide-react';
import Button from '@/components/ui/button';
import { toast } from 'sonner';

interface NewsletterProps {
  title?: string;
  subtitle?: string;
  onSubscribe?: (email: string) => void;
}

const Newsletter: React.FC<NewsletterProps> = ({
  title = 'Stay Updated',
  subtitle = 'Get exclusive offers and updates delivered to your inbox.',
  onSubscribe,
}) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      if (onSubscribe) {
        await onSubscribe(email);
      }
      toast.success('Successfully subscribed!');
      setEmail('');
    } catch (error) {
      toast.error('Failed to subscribe. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-2xl md:rounded-3xl p-8 md:p-12 lg:p-16 text-white">
      <div className="max-w-md mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold mb-3">{title}</h2>
        <p className="text-neutral-200 mb-6">{subtitle}</p>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/20 text-white placeholder-neutral-300 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm transition-all"
              disabled={isLoading}
            />
          </div>
          <Button
            type="submit"
            isLoading={isLoading}
            className="bg-white text-indigo-600 hover:bg-neutral-100 sm:w-auto"
            icon={<Send size={18} />}
            iconPosition="right"
          >
            Subscribe
          </Button>
        </form>

        <p className="text-xs text-neutral-300 mt-4">
          We respect your privacy. Unsubscribe anytime.
        </p>
      </div>
    </div>
  );
};

export default Newsletter;
