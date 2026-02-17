'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="fixed top-5 left-1/2 -translate-x-1/2 w-[min(1310px,calc(100%-40px))] z-50">
      <nav
        className={`flex items-center justify-between gap-5 transition-all duration-300 ${
          isScrolled
            ? 'px-6 py-3.5 rounded-[20px] border border-cream-300 bg-white/90 backdrop-blur-md shadow-lg'
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
          <span className="text-[31px] tracking-tight">AceAI</span>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-11 text-[17px] font-medium">
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
          <Link href="/login">
            <Button variant="outline" className="rounded-[14px] px-5 py-3 text-base font-medium border-charcoal">
              Log In
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="rounded-[14px] px-5 py-3 text-base font-medium bg-charcoal text-white hover:bg-charcoal/90">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>
    </header>
  );
}
