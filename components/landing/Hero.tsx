'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { AuthModal } from '@/components/auth/AuthModal';

export function Hero() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const [previewStyle, setPreviewStyle] = useState({
    scale: 0.84,
    shift: 80,
    opacity: 0.7,
  });

  useEffect(() => {
    const updatePreviewScale = () => {
      if (!previewRef.current) return;

      const rect = previewRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight || 1;
      const startPoint = viewportHeight * 0.96;
      const endPoint = viewportHeight * 0.22;
      const progress = Math.min(1, Math.max(0, (startPoint - rect.top) / (startPoint - endPoint)));

      setPreviewStyle({
        scale: 0.84 + progress * 0.16,
        shift: (1 - progress) * 80,
        opacity: 0.7 + progress * 0.3,
      });
    };

    updatePreviewScale();
    window.addEventListener('scroll', updatePreviewScale, { passive: true });
    window.addEventListener('resize', updatePreviewScale);

    return () => {
      window.removeEventListener('scroll', updatePreviewScale);
      window.removeEventListener('resize', updatePreviewScale);
    };
  }, []);

  return (
    <section
      id="home"
      className="pt-[138px] pb-0 px-8"
      style={{
        background: `
          linear-gradient(90deg, rgba(255, 255, 255, 0.1) 0 7%, transparent 7% 10%, rgba(255, 255, 255, 0.1) 10% 17%, transparent 17% 100%),
          linear-gradient(270deg, rgba(255, 255, 255, 0.11) 0 8%, transparent 8% 11%, rgba(255, 255, 255, 0.11) 11% 18%, transparent 18% 100%),
          radial-gradient(55rem 30rem at 8% 42%, rgba(187, 166, 255, 0.42), transparent 72%),
          radial-gradient(36rem 22rem at 12% 24%, rgba(243, 153, 232, 0.48), transparent 65%),
          radial-gradient(32rem 22rem at 84% 22%, rgba(238, 180, 248, 0.5), transparent 65%),
          radial-gradient(44rem 20rem at 86% 45%, rgba(255, 177, 139, 0.48), transparent 72%),
          #fbf9f8
        `,
      }}
    >
      <div className="max-w-[1300px] mx-auto">
        <div className="text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 px-6 py-3 rounded-full border-[1.5px] border-[#dbdbe0] bg-white/60 text-[22px] font-medium"
          >
            <span>✨</span>
            <span>
              Powered by{' '}
              <strong className="font-bold bg-gradient-to-r from-[#ff7e4f] to-[#8d52ff] bg-clip-text text-transparent">
                AI
              </strong>
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-9 mx-auto max-w-[1080px] text-[clamp(46px,6vw,88px)] leading-[1.04] tracking-[-0.045em] text-[#111217]"
          >
            AP Exam Prep Made{' '}
            <span className="bg-gradient-to-r from-[#ff7e4f] to-[#8d52ff] bg-clip-text text-transparent">
              Simple
            </span>{' '}
            and{' '}
            <span className="bg-gradient-to-r from-[#ff7e4f] to-[#8d52ff] bg-clip-text text-transparent">
              Powerful
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 mx-auto max-w-[900px] text-[clamp(17px,2vw,21px)] leading-[1.42] text-[#565760]"
          >
            Boost your AP scores with adaptive AI study plans aligned to the latest AP course frameworks,
            timed practice sets, and instant feedback for every subject.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-9"
          >
            <Button
              onClick={() => setIsAuthModalOpen(true)}
              className="text-lg rounded-2xl px-11 py-[18px] h-auto bg-[#111217] text-white hover:bg-[#111217]/90 font-medium"
            >
              Start Practicing Free
            </Button>
          </motion.div>

          {/* Auth Modal */}
          <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

          {/* Rating */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-6 inline-flex items-center gap-3 text-[17px] text-[#2f2f35]"
          >
            <span className="flex text-yellow-500 tracking-wider">
              {'★★★★★'}
            </span>
            <span className="w-0.5 h-6 bg-[#b9b9bf]" />
            <span>Loved by 10,000+ AP students</span>
          </motion.div>
        </div>

        {/* App Preview */}
        <motion.div
          ref={previewRef}
          initial={{ opacity: 0.7, y: 80, scale: 0.84 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mt-14 mx-auto w-[min(98%,1240px)] rounded-[22px] bg-[#f1f2f4] border-2 border-[#d3d6dd] overflow-hidden text-left shadow-[0_14px_30px_rgba(24,26,32,0.08)]"
          style={{
            transform: `translate3d(0, ${previewStyle.shift}px, 0) scale(${previewStyle.scale})`,
            opacity: previewStyle.opacity,
            transformOrigin: 'center top',
          }}
        >
          {/* Browser Top */}
          <div className="h-[62px] bg-[#ebecef] border-b border-[#d4d7de] flex items-center gap-4 px-5">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-[#f96857]" />
              <div className="w-3 h-3 rounded-full bg-[#f6be44]" />
              <div className="w-3 h-3 rounded-full bg-[#34c748]" />
            </div>
            <span className="font-mono text-base text-[#6e7583] tracking-wide">
              FRQ_Practice.java
            </span>
          </div>

          {/* Editor Body */}
          <div className="relative p-8 pb-28 bg-[#f3f4f6] min-h-[470px]">
            <div className="font-mono text-[clamp(16px,1.8vw,30px)] leading-relaxed text-[#2b3341] whitespace-nowrap overflow-x-auto">
              <p><span className="text-[#8f42ff]">public class</span> <span className="text-[#cb861a]">APCSAPrep</span> {'{'}</p>
              <p className="pl-8">
                <span className="text-[#8f42ff]">public static void</span>{' '}
                <span className="text-[#2c68e4]">main</span>(String[] args) {'{'}
              </p>
              <p className="pl-16">
                System.out.println(<span className="text-[#199a4a]">&quot;Welcome to your AI Tutor!&quot;</span>);
              </p>
              <div className="h-4" />
              <p className="pl-16"><span className="text-[#70798a]">{'// Practice Array Traversal'}</span></p>
              <p className="pl-16"><span className="text-[#8f42ff]">int</span>[] scores = {'{'}5, 4, 5, 3, 5{'}'}</p>
              <p className="pl-16">
                <span className="text-[#8f42ff]">double</span> average = calculateAverage(scores);
              </p>
              <div className="h-4" />
              <p className="pl-16"><span className="text-[#8f42ff]">if</span> (average &gt;= 4.0) {'{'}</p>
              <p className="pl-24">
                System.out.println(<span className="text-[#199a4a]">&quot;You&apos;re ready for the exam!&quot;</span>);
              </p>
              <p className="pl-16">{'}'}</p>
              <p className="pl-8">{'}'}</p>
              <p>{'}'}</p>
            </div>

            {/* Compile Chip */}
            <div className="absolute right-7 bottom-6 inline-flex items-center gap-3 px-4 py-3 rounded-xl bg-[#ddf6e6] border border-[#b7eacc] text-[#1d7f4b] text-[clamp(14px,1.1vw,18px)] font-bold shadow-md">
              <div className="relative w-5 h-5 rounded-full bg-[#1b8d4b] flex-shrink-0">
                <svg className="absolute inset-0 m-auto w-3 h-2" viewBox="0 0 12 8" fill="none">
                  <path d="M1 4L4.5 7L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              Compiled Successfully
            </div>
          </div>
        </motion.div>

        <div className="h-14" />
      </div>
    </section>
  );
}
