'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    description: 'Perfect for trying out AceAI',
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      '50 practice questions per month',
      'Basic AI explanations',
      'Progress tracking',
      '1 AP subject',
      'Community support',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Premium',
    description: 'Everything you need to score a 5',
    monthlyPrice: 12,
    yearlyPrice: 99,
    features: [
      'Unlimited practice questions',
      'Advanced AI tutoring',
      'Detailed analytics',
      'All AP subjects',
      'Code execution for AP CSA',
      'FRQ practice with rubric scoring',
      'Priority support',
      'Study streaks & rewards',
    ],
    cta: 'Start Free Trial',
    popular: true,
  },
];

export function Pricing() {
  const [isYearly, setIsYearly] = useState(true);

  return (
    <section id="pricing" className="py-[88px] px-8 bg-cream-100">
      <div className="max-w-[980px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-[760px] mx-auto mb-8"
        >
          <span className="pill text-base px-3.5 py-2">Pricing</span>
          <h2 className="mt-4 text-[clamp(40px,5.1vw,72px)] leading-[1.06] tracking-[-0.04em]">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 max-w-[620px] mx-auto text-lg leading-[1.45] text-charcoal-light">
            Start free and upgrade when you&apos;re ready for unlimited practice.
          </p>
        </motion.div>

        {/* Billing Toggle */}
        <div className="flex justify-center items-center gap-2.5 text-[15px] text-charcoal-light mb-8">
          <span className={!isYearly ? 'text-charcoal font-semibold' : ''}>Monthly</span>
          <label className="relative w-[46px] h-6 cursor-pointer">
            <input
              type="checkbox"
              checked={isYearly}
              onChange={() => setIsYearly(!isYearly)}
              className="opacity-0 w-0 h-0"
            />
            <span className="absolute inset-0 rounded-full bg-charcoal transition-all">
              <span
                className={`absolute w-4 h-4 rounded-full left-1 top-1 transition-transform duration-200 ${
                  isYearly ? 'translate-x-[22px]' : 'translate-x-0'
                }`}
                style={{ background: 'linear-gradient(90deg, #E07856, #D66B6B)' }}
              />
            </span>
          </label>
          <span className={isYearly ? 'text-charcoal font-semibold' : ''}>
            Yearly <span className="text-success font-medium">(Save 30%)</span>
          </span>
        </div>

        {/* Pricing Grid */}
        <div className="grid md:grid-cols-2 gap-5">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`rounded-[20px] border p-3.5 ${
                plan.popular
                  ? 'border-transparent bg-gradient-to-b from-primary-500 to-error'
                  : 'border-cream-300 bg-cream-200'
              }`}
            >
              <div className="rounded-2xl border border-cream-300 bg-white p-5">
                {/* Plan Dot */}
                <div
                  className="w-[26px] h-[26px] rounded-lg mb-3.5"
                  style={{
                    background: plan.popular
                      ? 'radial-gradient(circle at 30% 30%, #ffd3c9, #E07856 56%, #D66B6B 100%)'
                      : '#E8E4DD',
                  }}
                />

                <h3 className="text-[29px] tracking-[-0.03em] font-bold">{plan.name}</h3>
                <p className="mt-2 text-base text-charcoal-light mb-4">{plan.description}</p>

                {/* Price */}
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[49px] tracking-[-0.03em] leading-none font-bold">
                    ${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                  </span>
                  <span className="text-base text-charcoal-light">
                    /{isYearly ? 'year' : 'month'}
                  </span>
                </div>

                {/* CTA */}
                <div className="mt-4">
                  <Button
                    className={`w-full rounded-[10px] text-[15px] py-3 ${
                      plan.popular
                        ? 'bg-charcoal text-white hover:bg-charcoal/90'
                        : 'bg-white border border-charcoal text-charcoal hover:bg-cream-100'
                    }`}
                  >
                    {plan.cta}
                  </Button>
                  {plan.popular && (
                    <p className="mt-2 text-[13px] text-center text-charcoal-light">
                      7-day free trial, cancel anytime
                    </p>
                  )}
                </div>

                {/* Features */}
                <ul className="mt-3.5 mx-0.5 space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-[15px] text-charcoal">
                      <Check className="w-4 h-4 mt-0.5 text-charcoal flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
