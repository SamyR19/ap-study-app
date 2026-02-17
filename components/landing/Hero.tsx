'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';

export function Hero() {
  return (
    <section className="gradient-bg-hero pt-[138px] pb-0 px-8">
      <div className="max-w-[1300px] mx-auto">
        <div className="text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 px-6 py-3 rounded-full border-[1.5px] border-cream-300 bg-white/60 text-[22px] font-medium"
          >
            <span>✨</span>
            <span>
              Powered by <strong className="gradient-text font-bold">AI</strong>
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-9 mx-auto max-w-[1080px] text-[clamp(46px,6vw,88px)] leading-[1.04] tracking-[-0.045em]"
          >
            Ace your AP exams with
            <br />
            <span className="gradient-text">AI-powered</span> practice
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 mx-auto max-w-[900px] text-[clamp(17px,2vw,21px)] leading-[1.42] text-charcoal-light"
          >
            Practice with realistic MCQs and FRQs, get instant AI feedback, and track your progress
            across all AP subjects. Built for students who want to score 5s.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-9"
          >
            <Button className="text-lg rounded-2xl px-11 py-[18px] h-auto bg-charcoal text-white hover:bg-charcoal/90 font-medium">
              Start Practicing Free
            </Button>
          </motion.div>

          {/* Rating */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-6 inline-flex items-center gap-3 text-[17px] text-charcoal"
          >
            <span className="flex text-yellow-500 tracking-wider">
              <Star className="w-5 h-5 fill-current" />
              <Star className="w-5 h-5 fill-current" />
              <Star className="w-5 h-5 fill-current" />
              <Star className="w-5 h-5 fill-current" />
              <Star className="w-5 h-5 fill-current" />
            </span>
            <span className="w-0.5 h-6 bg-cream-400" />
            <span>Loved by 10,000+ AP students</span>
          </motion.div>
        </div>

        {/* App Preview */}
        <motion.div
          initial={{ opacity: 0.7, y: 80, scale: 0.84 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mt-14 mx-auto w-[min(98%,1240px)] rounded-[22px] bg-cream-200 border-2 border-cream-300 overflow-hidden shadow-xl"
        >
          {/* Browser Top */}
          <div className="h-[62px] bg-cream-200 border-b border-cream-300 flex items-center gap-4 px-5">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-[#f96857]" />
              <div className="w-3 h-3 rounded-full bg-[#f6be44]" />
              <div className="w-3 h-3 rounded-full bg-[#34c748]" />
            </div>
            <span className="font-mono text-base text-charcoal-light tracking-wide">
              aceai.study
            </span>
          </div>

          {/* Editor Body */}
          <div className="relative p-8 pb-28 bg-code-bg min-h-[470px]">
            <div className="font-mono text-[clamp(16px,1.8vw,30px)] leading-relaxed text-charcoal whitespace-nowrap overflow-x-auto">
              <p className="text-purple-600">public class</p>
              <p className="pl-8 text-amber-600">APStudent</p>
              <p className="pl-8">{`{`}</p>
              <p className="pl-16">
                <span className="text-purple-600">private</span>{' '}
                <span className="text-blue-600">String</span> name;
              </p>
              <p className="pl-16">
                <span className="text-purple-600">private</span>{' '}
                <span className="text-blue-600">int</span> targetScore = 5;
              </p>
              <div className="h-4" />
              <p className="pl-16">
                <span className="text-purple-600">public void</span>{' '}
                <span className="text-amber-600">study</span>() {`{`}
              </p>
              <p className="pl-24">
                <span className="text-gray-500">{`// Practice with AceAI`}</span>
              </p>
              <p className="pl-24">
                AceAI.<span className="text-green-600">practice</span>();
              </p>
              <p className="pl-16">{`}`}</p>
              <p className="pl-8">{`}`}</p>
            </div>

            {/* Compile Chip */}
            <div className="absolute right-7 bottom-6 inline-flex items-center gap-3 px-4 py-3 rounded-xl bg-success-light border border-[#b7eacc] text-success-dark text-[clamp(14px,1.1vw,18px)] font-bold shadow-md">
              <div className="relative w-5 h-5 rounded-full bg-success flex-shrink-0">
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
