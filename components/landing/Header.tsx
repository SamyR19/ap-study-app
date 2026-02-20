'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { AuthModal } from '@/components/auth/AuthModal';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 120);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header className="fixed top-5 left-1/2 -translate-x-1/2 w-[min(1310px,calc(100%-40px))] z-50">
        <nav
          className={`flex items-center justify-between gap-5 transition-all duration-300 ${
            isScrolled
              ? 'px-6 py-3.5 rounded-[20px] border border-[#e1e1e6] bg-white/93 backdrop-blur-md shadow-[0_12px_30px_rgba(21,22,28,0.08)]'
              : 'p-0 border-transparent bg-transparent'
          }`}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 font-bold">
            <Image
              src="/aceai-logo.svg"
              alt="AceAI"
              width={48}
              height={48}
              className="w-12 h-12 object-contain"
            />
            <span className="text-[31px] tracking-[-0.03em] text-[#111217]">AceAI</span>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-11 text-[17px] font-medium text-[#111217]">
            <Link href="#home" className="opacity-95 hover:opacity-100 transition-opacity">
              Home
            </Link>
            <Link href="#features" className="opacity-95 hover:opacity-100 transition-opacity">
              Features
            </Link>
            <Link href="#pricing" className="opacity-95 hover:opacity-100 transition-opacity">
              Pricing
            </Link>
            <Link href="#faq" className="opacity-95 hover:opacity-100 transition-opacity">
              FAQ
            </Link>
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setIsAuthModalOpen(true)}
              className="rounded-[14px] px-5 py-3 text-base font-medium border-[1.6px] border-[#16171e] bg-transparent text-[#111217] hover:bg-gray-50"
            >
              Log In
            </Button>
            <Button
              onClick={() => setIsAuthModalOpen(true)}
              className="rounded-[14px] px-5 py-3 text-base font-medium bg-[#111217] text-white hover:bg-[#111217]/90"
            >
              Get Started
            </Button>
          </div>
        </nav>
      </header>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
}
