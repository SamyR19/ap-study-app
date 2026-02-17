'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Star, Mail, Copy } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-[74px] bg-[#0c0d12] text-[#eef0f4] pt-[88px] pb-[26px] px-8">
      <div className="max-w-[1300px] mx-auto">
        {/* Trial CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-[980px] mx-auto"
        >
          <h2 className="text-[clamp(44px,5.3vw,82px)] leading-[1.05] tracking-[-0.04em]">
            Ready to <span className="gradient-text">ace your APs?</span>
          </h2>
          <p className="mt-5 max-w-[860px] mx-auto text-[clamp(16px,1.4vw,27px)] text-[#868890] leading-[1.42]">
            Join thousands of students who are already practicing smarter with AI-powered feedback.
          </p>

          {/* Email Form */}
          <div className="mt-8 max-w-[700px] mx-auto p-2 rounded-2xl bg-[#16171d] flex gap-2">
            <Input
              type="email"
              placeholder="Enter your email"
              className="flex-1 border-none rounded-xl bg-[#1f2028] text-[#e8eaef] text-[clamp(15px,1.2vw,20px)] py-3.5 px-4 placeholder:text-[#8a8c93]"
            />
            <Button className="rounded-xl border-[#eceff6] bg-[#eceff6] text-[#15161c] text-[17px] py-3 px-6 min-w-[144px] hover:bg-[#d8dbe3]">
              Get Started
            </Button>
          </div>

          {/* Rating */}
          <div className="mt-5 inline-flex items-center gap-2.5 text-base text-[#d4d6dd]">
            <span className="flex text-yellow-500">
              <Star className="w-4 h-4 fill-current" />
              <Star className="w-4 h-4 fill-current" />
              <Star className="w-4 h-4 fill-current" />
              <Star className="w-4 h-4 fill-current" />
              <Star className="w-4 h-4 fill-current" />
            </span>
            <span className="text-[#9598a1]">|</span>
            <span>Trusted by 10,000+ students</span>
          </div>
        </motion.div>

        <div className="mt-[52px] border-t border-[#23242d]" />

        {/* Footer Main */}
        <div className="mt-[46px] grid grid-cols-1 md:grid-cols-[1.7fr_1fr_1fr_1fr] gap-7">
          {/* Brand Column */}
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-br from-primary-500 to-error">
                <div className="w-full h-full rounded-full bg-[#12131a] flex items-center justify-center">
                  <Image src="/aceai-logo.svg" alt="AceAI" width={40} height={40} />
                </div>
              </div>
              <p className="text-[clamp(20px,1.6vw,30px)] leading-[1.35] text-[#81838d]">
                Practice smarter,<br />score higher.
              </p>
            </div>
            <div className="mt-2.5 max-w-[320px] border border-[#2c2d35] rounded-xl bg-[#111218] p-2.5 flex items-center justify-between gap-2.5 text-[#9396a0] text-base">
              <div className="flex items-center gap-2">
                <Mail className="w-[18px] h-[18px]" />
                <span>hello@aceai.study</span>
              </div>
              <Copy className="w-[18px] h-[18px] cursor-pointer hover:text-white transition-colors" />
            </div>
          </div>

          {/* Product Column */}
          <div>
            <h4 className="mb-3 text-[17px] text-[#f2f4f8] font-semibold">Product</h4>
            <Link href="#features" className="block mb-2.5 text-[15px] text-[#90939c] hover:text-white transition-colors">
              Features
            </Link>
            <Link href="#pricing" className="block mb-2.5 text-[15px] text-[#90939c] hover:text-white transition-colors">
              Pricing
            </Link>
            <Link href="#" className="block mb-2.5 text-[15px] text-[#90939c] hover:text-white transition-colors">
              Subjects
            </Link>
            <Link href="#" className="block mb-2.5 text-[15px] text-[#90939c] hover:text-white transition-colors">
              Roadmap
            </Link>
          </div>

          {/* Resources Column */}
          <div>
            <h4 className="mb-3 text-[17px] text-[#f2f4f8] font-semibold">Resources</h4>
            <Link href="#" className="block mb-2.5 text-[15px] text-[#90939c] hover:text-white transition-colors">
              Blog
            </Link>
            <Link href="#faq" className="block mb-2.5 text-[15px] text-[#90939c] hover:text-white transition-colors">
              FAQ
            </Link>
            <Link href="#" className="block mb-2.5 text-[15px] text-[#90939c] hover:text-white transition-colors">
              AP Exam Tips
            </Link>
            <Link href="#" className="block mb-2.5 text-[15px] text-[#90939c] hover:text-white transition-colors">
              Study Guides
            </Link>
          </div>

          {/* Social Column */}
          <div>
            <h4 className="mb-3 text-[17px] text-[#f2f4f8] font-semibold">Connect</h4>
            <a href="#" className="inline-flex items-center gap-2 border border-[#2e3038] rounded-[10px] bg-[#16171e] px-3 py-2.5 mb-2.5 text-[#9ea2ab] hover:text-white transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              Twitter/X
            </a>
            <a href="#" className="inline-flex items-center gap-2 border border-[#2e3038] rounded-[10px] bg-[#16171e] px-3 py-2.5 mb-2.5 ml-2 text-[#9ea2ab] hover:text-white transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
              </svg>
              Discord
            </a>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-11 pt-[18px] border-t border-[#23242d] flex flex-wrap items-center justify-between gap-3.5">
          <p className="text-[#82858f] text-[15px]">
            © 2025 AceAI. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="#" className="text-[#82858f] text-[15px] hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="text-[#82858f] text-[15px] hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>
          <div className="inline-flex items-center gap-2 border border-[#333540] rounded-full bg-[#171922] text-[#e9ebf0] text-[15px] px-3.5 py-2">
            <span className="w-2 h-2 rounded-full bg-green-400" />
            All systems operational
          </div>
        </div>
      </div>
    </footer>
  );
}
