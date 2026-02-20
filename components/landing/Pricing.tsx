'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import { AuthModal } from '@/components/auth/AuthModal';

export function Pricing() {
  const [isYearly, setIsYearly] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <>
      <section id="pricing" className="py-[88px] px-8" style={{ background: '#efeff1' }}>
        <div className="max-w-[980px] mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-[760px] mx-auto mb-6"
          >
            <span
              className="inline-flex items-center px-4 py-2 rounded-full text-base font-medium"
              style={{
                border: '1.5px solid #d4d4da',
                background: '#f3f3f6',
                color: '#111217'
              }}
            >
              Pricing & Plans
            </span>
            <h2
              className="mt-4 font-bold"
              style={{
                fontSize: 'clamp(40px, 5.1vw, 72px)',
                lineHeight: 1.06,
                letterSpacing: '-0.04em',
                color: '#111217'
              }}
            >
              Affordable AP Pricing Plans
            </h2>
            <p
              className="mt-4 max-w-[620px] mx-auto"
              style={{
                fontSize: '18px',
                lineHeight: 1.45,
                color: '#565760'
              }}
            >
              Flexible pricing for focused AP prep or full multi-subject access.
            </p>
          </motion.div>

          {/* Billing Toggle */}
          <div
            className="flex justify-center items-center gap-2.5 mb-8"
            style={{ fontSize: '15px', color: '#5e5f67' }}
          >
            <span style={{ fontWeight: isYearly ? 400 : 700, color: isYearly ? '#5e5f67' : '#1a1b22' }}>
              Billed Monthly
            </span>
            <label className="relative w-[46px] h-6 cursor-pointer">
              <input
                type="checkbox"
                checked={isYearly}
                onChange={() => setIsYearly(!isYearly)}
                className="opacity-0 w-0 h-0"
              />
              <span
                className="absolute inset-0 rounded-full transition-all"
                style={{ background: '#111217', boxShadow: 'inset 0 0 0 1px #08090d' }}
              >
                <span
                  className={`absolute w-4 h-4 rounded-full left-1 top-1 transition-transform duration-200 ${
                    isYearly ? 'translate-x-[22px]' : 'translate-x-0'
                  }`}
                  style={{ background: 'linear-gradient(90deg, #ff5c42, #a13fff)' }}
                />
              </span>
            </label>
            <span style={{ fontWeight: isYearly ? 700 : 400, color: isYearly ? '#1a1b22' : '#5e5f67' }}>
              Billed yearly
            </span>
          </div>

          {/* Pricing Grid */}
          <div className="grid md:grid-cols-2 gap-5">
            {/* Basic Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="rounded-[20px] p-3.5"
              style={{
                border: '1px solid #d6d6dd',
                background: '#e8e7ea'
              }}
            >
              <div
                className="rounded-2xl p-5"
                style={{
                  border: '1px solid #e0e0e6',
                  background: '#ffffff'
                }}
              >
                {/* Plan Dot */}
                <div
                  className="w-[26px] h-[26px] rounded-lg mb-3.5"
                  style={{
                    background: 'radial-gradient(circle at 30% 30%, #ffd3c9, #ff6f49 56%, #b544ff 100%)'
                  }}
                />

                <h3
                  className="font-bold"
                  style={{ fontSize: '29px', letterSpacing: '-0.03em', color: '#111217' }}
                >
                  Basic Plan
                </h3>
                <p
                  className="mt-2 mb-4"
                  style={{ fontSize: '16px', color: '#575861', lineHeight: 1.4 }}
                >
                  Perfect for focused prep in one AP subject.
                </p>

                {/* Price */}
                <div className="flex items-baseline gap-1.5">
                  <span
                    className="font-bold"
                    style={{ fontSize: '49px', letterSpacing: '-0.03em', lineHeight: 1, color: '#111217' }}
                  >
                    ${isYearly ? '49.99' : '4.99'}
                  </span>
                  <span style={{ fontSize: '16px', color: '#5f6068' }}>
                    /{isYearly ? 'year' : 'month'}
                  </span>
                </div>

                {isYearly && (
                  <p className="mt-1 text-sm font-medium" style={{ color: '#1b8d4b' }}>
                    Save $10 compared to monthly
                  </p>
                )}

                {/* CTA */}
                <div className="mt-4">
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="w-full rounded-[10px] py-3 font-medium transition-colors"
                    style={{
                      fontSize: '15px',
                      background: '#111217',
                      color: '#ffffff',
                      border: '1.6px solid #16171e'
                    }}
                  >
                    Get Started
                  </button>
                </div>
              </div>

              {/* Features */}
              <ul className="mt-3.5 mx-2 space-y-2">
                <li className="flex items-start gap-2" style={{ fontSize: '15px', color: '#2e2f36' }}>
                  <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Choose one AP course and build a custom roadmap</span>
                </li>
                <li className="flex items-start gap-2" style={{ fontSize: '15px', color: '#2e2f36' }}>
                  <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Unlimited practice questions</span>
                </li>
                <li className="flex items-start gap-2" style={{ fontSize: '15px', color: '#2e2f36' }}>
                  <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>AI-powered explanations</span>
                </li>
                <li className="flex items-start gap-2" style={{ fontSize: '15px', color: '#2e2f36' }}>
                  <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Progress tracking & analytics</span>
                </li>
              </ul>
            </motion.div>

            {/* Pro Plan - Most Popular */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="rounded-[20px] p-3.5 relative"
              style={{
                background: 'linear-gradient(180deg, #ff5a44 0%, #b43fff 100%)',
                padding: '3px'
              }}
            >
              {/* Most Popular Badge */}
              <div
                className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full flex items-center gap-1.5"
                style={{
                  background: '#111217',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 600
                }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Most Popular
              </div>

              <div className="rounded-[17px] p-3.5" style={{ background: '#e8e7ea' }}>
                <div
                  className="rounded-2xl p-5"
                  style={{
                    border: '1px solid #e0e0e6',
                    background: '#ffffff'
                  }}
                >
                  {/* Plan Dot */}
                  <div
                    className="w-[26px] h-[26px] rounded-lg mb-3.5"
                    style={{
                      background: 'radial-gradient(circle at 30% 30%, #ffd3c9, #ff6f49 56%, #b544ff 100%)'
                    }}
                  />

                  <h3
                    className="font-bold"
                    style={{ fontSize: '29px', letterSpacing: '-0.03em', color: '#111217' }}
                  >
                    Pro Plan
                  </h3>
                  <p
                    className="mt-2 mb-4"
                    style={{ fontSize: '16px', color: '#575861', lineHeight: 1.4 }}
                  >
                    Best for students taking multiple AP exams.
                  </p>

                  {/* Price */}
                  <div className="flex items-baseline gap-1.5">
                    <span
                      className="font-bold"
                      style={{ fontSize: '49px', letterSpacing: '-0.03em', lineHeight: 1, color: '#111217' }}
                    >
                      ${isYearly ? '99' : '12.99'}
                    </span>
                    <span style={{ fontSize: '16px', color: '#5f6068' }}>
                      /{isYearly ? 'year' : 'month'}
                    </span>
                  </div>

                  {isYearly && (
                    <p className="mt-1 text-sm font-medium" style={{ color: '#1b8d4b' }}>
                      Save $56 compared to monthly
                    </p>
                  )}

                  {/* CTA */}
                  <div className="mt-4">
                    <button
                      onClick={() => setShowAuthModal(true)}
                      className="w-full rounded-[10px] py-3 font-medium transition-colors"
                      style={{
                        fontSize: '15px',
                        background: '#111217',
                        color: '#ffffff',
                        border: '1.6px solid #16171e'
                      }}
                    >
                      Start your free trial
                    </button>
                    <p
                      className="mt-2 text-center"
                      style={{ fontSize: '13px', color: '#62636c' }}
                    >
                      Free 7-day trial
                    </p>
                  </div>
                </div>

                {/* Features */}
                <ul className="mt-3.5 mx-2 space-y-2">
                  <li className="flex items-start gap-2" style={{ fontSize: '15px', color: '#2e2f36' }}>
                    <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Full AP catalog access across every available class</span>
                  </li>
                  <li className="flex items-start gap-2" style={{ fontSize: '15px', color: '#2e2f36' }}>
                    <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Advanced AI tutoring & FRQ scoring</span>
                  </li>
                  <li className="flex items-start gap-2" style={{ fontSize: '15px', color: '#2e2f36' }}>
                    <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Cross-subject analytics & exam countdown</span>
                  </li>
                  <li className="flex items-start gap-2" style={{ fontSize: '15px', color: '#2e2f36' }}>
                    <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Priority support & study streaks</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>

          {/* Cram Plan - Full Width */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-5 max-w-[480px] mx-auto rounded-[20px] p-3.5"
            style={{
              border: '1px solid #d6d6dd',
              background: '#e8e7ea'
            }}
          >
            <div
              className="rounded-2xl p-5"
              style={{
                border: '1px solid #e0e0e6',
                background: '#ffffff'
              }}
            >
              {/* Plan Dot */}
              <div
                className="w-[26px] h-[26px] rounded-lg mb-3.5"
                style={{
                  background: 'radial-gradient(circle at 30% 30%, #ffd3c9, #ff6f49 56%, #b544ff 100%)'
                }}
              />

              <h3
                className="font-bold"
                style={{ fontSize: '29px', letterSpacing: '-0.03em', color: '#111217' }}
              >
                Cram Plan
              </h3>
              <p
                className="mt-2 mb-4"
                style={{ fontSize: '16px', color: '#575861', lineHeight: 1.4 }}
              >
                Three months of full-access AP prep for last-minute studying.
              </p>

              {/* Price */}
              <div className="flex items-baseline gap-1.5">
                <span
                  className="font-bold"
                  style={{ fontSize: '49px', letterSpacing: '-0.03em', lineHeight: 1, color: '#111217' }}
                >
                  $39.99
                </span>
                <span style={{ fontSize: '16px', color: '#5f6068' }}>
                  /3 months
                </span>
              </div>

              {/* CTA */}
              <div className="mt-4">
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="w-full rounded-[10px] py-3 font-medium transition-colors"
                  style={{
                    fontSize: '15px',
                    background: '#111217',
                    color: '#ffffff',
                    border: '1.6px solid #16171e'
                  }}
                >
                  Get Cram Mode
                </button>
              </div>
            </div>

            {/* Features */}
            <ul className="mt-3.5 mx-2 space-y-2">
              <li className="flex items-start gap-2" style={{ fontSize: '15px', color: '#2e2f36' }}>
                <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>$39.99 flat for 3 months of full-access tools</span>
              </li>
              <li className="flex items-start gap-2" style={{ fontSize: '15px', color: '#2e2f36' }}>
                <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>All AP subjects included</span>
              </li>
              <li className="flex items-start gap-2" style={{ fontSize: '15px', color: '#2e2f36' }}>
                <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Includes full AI scoring, timelines, and drills</span>
              </li>
              <li className="flex items-start gap-2" style={{ fontSize: '15px', color: '#2e2f36' }}>
                <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Built for last-minute, high-intensity exam prep</span>
              </li>
            </ul>
          </motion.div>
        </div>
      </section>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}
