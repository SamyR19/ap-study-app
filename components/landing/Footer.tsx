'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Mail, ArrowRight } from 'lucide-react';
import { AuthModal } from '@/components/auth/AuthModal';

export function Footer() {
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <>
      <footer
        className="mt-[74px] pt-[88px] pb-[26px] px-8"
        style={{ background: '#0c0d12', color: '#eef0f4' }}
      >
        <div className="max-w-[1300px] mx-auto">
          {/* Trial CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-[980px] mx-auto"
          >
            <h2
              className="font-bold"
              style={{
                fontSize: 'clamp(44px, 5.3vw, 82px)',
                lineHeight: 1.05,
                letterSpacing: '-0.04em',
                color: '#eef0f4',
                margin: 0
              }}
            >
              Start your 7-day{' '}
              <span
                style={{
                  background: 'linear-gradient(90deg, #ff4f3f, #ff8f32 44%, #b340ff 92%)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent'
                }}
              >
                free trial
              </span>
            </h2>
            <p
              className="mt-5 max-w-[860px] mx-auto"
              style={{
                fontSize: 'clamp(16px, 1.4vw, 27px)',
                color: '#868890',
                lineHeight: 1.42,
                margin: 0
              }}
            >
              Start your free trial now and get a structured AP prep workflow with zero commitment.
            </p>

            {/* Email Form */}
            <div
              className="mt-8 max-w-[700px] mx-auto p-2 rounded-2xl flex gap-2"
              style={{ background: '#16171d' }}
            >
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 rounded-xl border-none outline-none"
                style={{
                  background: '#1f2028',
                  color: '#e8eaef',
                  fontSize: 'clamp(15px, 1.2vw, 20px)',
                  padding: '14px 16px'
                }}
              />
              <button
                onClick={() => setShowAuthModal(true)}
                className="rounded-xl font-medium transition-colors"
                style={{
                  background: '#eceff6',
                  color: '#15161c',
                  fontSize: '17px',
                  padding: '12px 24px',
                  minWidth: '144px',
                  border: '1.6px solid #eceff6'
                }}
              >
                Get Started
              </button>
            </div>

            {/* Rating */}
            <div
              className="mt-5 inline-flex items-center gap-2.5"
              style={{ fontSize: '16px', color: '#d4d6dd' }}
            >
              <span className="flex text-yellow-500">
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
              </span>
              <span style={{ color: '#9598a1' }}>|</span>
              <span>
                <strong>4.9 rating</strong>{' '}
                <span style={{ color: '#9598a1' }}>Based on students</span>
              </span>
            </div>
          </motion.div>

          <div className="mt-[52px]" style={{ borderTop: '1px solid #23242d' }} />

          {/* Footer Main */}
          <div className="mt-[46px] grid grid-cols-1 md:grid-cols-[1.7fr_1fr_1fr_1fr] gap-7">
            {/* Brand Column */}
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-3.5">
                <div
                  className="w-14 h-14 rounded-full p-0.5"
                  style={{ background: 'linear-gradient(140deg, #ff523e, #ae3fff)' }}
                >
                  <div
                    className="w-full h-full rounded-full flex items-center justify-center"
                    style={{ background: '#12131a' }}
                  >
                    <Image src="/aceai-logo.svg" alt="AceAI" width={40} height={40} />
                  </div>
                </div>
                <p
                  style={{
                    fontSize: 'clamp(20px, 1.6vw, 30px)',
                    lineHeight: 1.35,
                    color: '#81838d',
                    margin: 0
                  }}
                >
                  Simplifying AP Prep and<br />Helping Students Score Higher.
                </p>
              </div>
              <div
                className="mt-2.5 max-w-[320px] rounded-xl p-2.5 flex items-center justify-between gap-2.5"
                style={{
                  border: '1px solid #2c2d35',
                  background: '#111218',
                  color: '#9396a0',
                  fontSize: '16px'
                }}
              >
                <div className="flex items-center gap-2">
                  <Mail className="w-[18px] h-[18px]" />
                  <span>hello@aceai.study</span>
                </div>
                <ArrowRight className="w-[18px] h-[18px]" />
              </div>
            </div>

            {/* Home Column */}
            <div>
              <h4
                className="mb-3 font-semibold"
                style={{ fontSize: '17px', color: '#f2f4f8' }}
              >
                Home
              </h4>
              <Link
                href="#features"
                className="block mb-2.5 transition-colors hover:text-white"
                style={{ fontSize: '15px', color: '#90939c', textDecoration: 'none' }}
              >
                Features
              </Link>
              <Link
                href="#pricing"
                className="block mb-2.5 transition-colors hover:text-white"
                style={{ fontSize: '15px', color: '#90939c', textDecoration: 'none' }}
              >
                Pricing
              </Link>
              <Link
                href="#testimonials"
                className="block mb-2.5 transition-colors hover:text-white"
                style={{ fontSize: '15px', color: '#90939c', textDecoration: 'none' }}
              >
                Testimonials
              </Link>
              <Link
                href="#faq"
                className="block mb-2.5 transition-colors hover:text-white"
                style={{ fontSize: '15px', color: '#90939c', textDecoration: 'none' }}
              >
                FAQs
              </Link>
            </div>

            {/* Pages Column */}
            <div>
              <h4
                className="mb-3 font-semibold"
                style={{ fontSize: '17px', color: '#f2f4f8' }}
              >
                Pages
              </h4>
              <Link
                href="#"
                className="block mb-2.5 transition-colors hover:text-white"
                style={{ fontSize: '15px', color: '#90939c', textDecoration: 'none' }}
              >
                Home
              </Link>
              <Link
                href="#"
                className="block mb-2.5 transition-colors hover:text-white"
                style={{ fontSize: '15px', color: '#90939c', textDecoration: 'none' }}
              >
                Contact
              </Link>
              <Link
                href="#"
                className="block mb-2.5 transition-colors hover:text-white"
                style={{ fontSize: '15px', color: '#90939c', textDecoration: 'none' }}
              >
                Privacy Policy
              </Link>
              <Link
                href="#"
                className="block mb-2.5 transition-colors hover:text-white"
                style={{ fontSize: '15px', color: '#90939c', textDecoration: 'none' }}
              >
                Terms of Service
              </Link>
            </div>

            {/* Social Column */}
            <div>
              <h4
                className="mb-3 font-semibold"
                style={{ fontSize: '17px', color: '#f2f4f8' }}
              >
                Social
              </h4>
              <a
                href="#"
                className="inline-flex items-center gap-2 rounded-[10px] px-3 py-2.5 mb-2.5 transition-colors hover:text-white"
                style={{
                  border: '1px solid #2e3038',
                  background: '#16171e',
                  color: '#9ea2ab',
                  textDecoration: 'none'
                }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                Twitter/X
              </a>
              <br />
              <a
                href="#"
                className="inline-flex items-center gap-2 rounded-[10px] px-3 py-2.5 mb-2.5 transition-colors hover:text-white"
                style={{
                  border: '1px solid #2e3038',
                  background: '#16171e',
                  color: '#9ea2ab',
                  textDecoration: 'none'
                }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" fill="none" stroke="currentColor" strokeWidth="2" />
                  <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
                  <circle cx="18" cy="6" r="1.5" />
                </svg>
                Instagram
              </a>
            </div>
          </div>

          {/* Footer Bottom */}
          <div
            className="mt-11 pt-[18px] flex flex-wrap items-center justify-between gap-3.5"
            style={{ borderTop: '1px solid #23242d' }}
          >
            <p style={{ color: '#82858f', fontSize: '15px', margin: 0 }}>
              © 2026 AceAI. All rights reserved.
            </p>
            <div
              className="inline-flex items-center gap-2 rounded-full px-3.5 py-2"
              style={{
                border: '1px solid #333540',
                background: '#171922',
                color: '#e9ebf0',
                fontSize: '15px'
              }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: '#6de06a' }}
              />
              All systems operational
            </div>
            <Link
              href="#"
              className="transition-colors hover:text-white"
              style={{ color: '#82858f', fontSize: '15px', textDecoration: 'none' }}
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}
