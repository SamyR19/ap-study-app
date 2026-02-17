'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Zap, BarChart3, MessageCircle, Crown } from 'lucide-react';

interface SubscriptionCardProps {
  isPremium: boolean;
  nextBillingDate?: string;
  paymentMethod?: string;
  onUpgrade?: () => void;
  onManage?: () => void;
  onCancel?: () => void;
}

const freeFeatures = [
  '3 questions per day',
  'Basic progress tracking',
  'Limited hints',
  'Community support',
];

const premiumFeatures = [
  'Unlimited questions',
  'Advanced AI grading & feedback',
  'Full progress analytics',
  'Detailed explanations',
  'Priority support',
  'All future features',
];

export function SubscriptionCard({
  isPremium,
  nextBillingDate,
  paymentMethod,
  onUpgrade,
  onManage,
  onCancel,
}: SubscriptionCardProps) {
  if (isPremium) {
    return (
      <Card className="border-cream-300">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-charcoal">Premium</h3>
                <Badge className="bg-success-light text-success-dark border-0">
                  <Check className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              </div>
              <p className="text-sm text-charcoal-light">
                Full access to all features
              </p>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-charcoal-light">Next billing date</span>
              <span className="font-medium text-charcoal">{nextBillingDate || 'N/A'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-charcoal-light">Payment method</span>
              <span className="font-medium text-charcoal">{paymentMethod || 'N/A'}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={onManage}
              className="flex-1 bg-charcoal hover:bg-charcoal/90 text-white rounded-xl"
            >
              Manage Subscription
            </Button>
          </div>

          <button
            onClick={onCancel}
            className="w-full mt-3 text-sm text-charcoal-light hover:text-error transition-colors"
          >
            Cancel Subscription
          </button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Free Plan */}
        <Card className="border-cream-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Badge className="bg-cream-200 text-charcoal border-0">Current Plan</Badge>
            </div>
            <h3 className="text-xl font-bold text-charcoal mb-1">Free</h3>
            <p className="text-charcoal-light text-sm mb-4">Basic access to practice</p>

            <ul className="space-y-3 mb-6">
              {freeFeatures.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm text-charcoal-light">
                  <Check className="w-4 h-4 text-charcoal-light" />
                  {feature}
                </li>
              ))}
            </ul>

            <Button
              variant="outline"
              disabled
              className="w-full border-cream-300 text-charcoal-light"
            >
              Current Plan
            </Button>
          </CardContent>
        </Card>

        {/* Premium Plan */}
        <Card className="border-primary-500 border-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-primary-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
            RECOMMENDED
          </div>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            </div>
            <h3 className="text-xl font-bold text-charcoal mb-1">Premium</h3>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-3xl font-bold text-charcoal">$4.99</span>
              <span className="text-charcoal-light">/month</span>
            </div>
            <p className="text-sm text-success mb-4">
              or $29/year (save 51%)
            </p>

            <ul className="space-y-3 mb-6">
              {premiumFeatures.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm text-charcoal">
                  <Check className="w-4 h-4 text-success" />
                  {feature}
                </li>
              ))}
            </ul>

            <Button
              onClick={onUpgrade}
              className="w-full bg-primary-500 hover:bg-primary-600 text-white rounded-xl"
            >
              <Zap className="w-4 h-4 mr-2" />
              Upgrade to Premium
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-cream-300">
          <CardContent className="p-4 text-center">
            <Zap className="w-8 h-8 text-primary-500 mx-auto mb-2" />
            <h4 className="font-semibold text-charcoal">Unlimited Practice</h4>
            <p className="text-sm text-charcoal-light mt-1">
              No daily limits. Practice as much as you want.
            </p>
          </CardContent>
        </Card>
        <Card className="border-cream-300">
          <CardContent className="p-4 text-center">
            <MessageCircle className="w-8 h-8 text-primary-500 mx-auto mb-2" />
            <h4 className="font-semibold text-charcoal">AI Feedback</h4>
            <p className="text-sm text-charcoal-light mt-1">
              Detailed explanations from our AI tutor.
            </p>
          </CardContent>
        </Card>
        <Card className="border-cream-300">
          <CardContent className="p-4 text-center">
            <BarChart3 className="w-8 h-8 text-primary-500 mx-auto mb-2" />
            <h4 className="font-semibold text-charcoal">Full Analytics</h4>
            <p className="text-sm text-charcoal-light mt-1">
              Track every aspect of your progress.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
